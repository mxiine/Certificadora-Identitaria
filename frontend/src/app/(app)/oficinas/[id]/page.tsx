'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Carregando, Erro, Field, PageHeader, SemPermissao, Vazio } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { dataBR, horasBR } from '@/lib/format';
import { PAPEIS, atendimentosApi, oficinasApi, rotuloPapel, vinculosApi } from '@/lib/oficinas';
import type { Atendimento, Oficina, PapelVinculo, Vinculo, Voluntario } from '@/lib/types';

export default function DetalheOficina() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { usuario } = useAuth();
  const coordenador = usuario?.perfil === 'COORDENADOR';

  const [oficina, setOficina] = useState<Oficina | null | undefined>(undefined);
  const [vinculos, setVinculos] = useState<Vinculo[]>([]);
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const [o, v, a] = await Promise.all([oficinasApi.buscar(id), vinculosApi.daOficina(id), atendimentosApi.daOficina(id)]);
    setOficina(o);
    setVinculos(v);
    setAtendimentos(a);
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => {
    if (coordenador) api.listarVoluntarios().then(setVoluntarios).catch((e) => setErro(e.message));
  }, [coordenador]);

  if (oficina === undefined) return <Carregando />;
  if (oficina === null) return <Vazio titulo="Oficina não encontrada" texto="Ela pode ter sido removida." acao={<Link href="/oficinas" className="btn-primary">Voltar às oficinas</Link>} />;

  // Permissão: voluntário só enxerga oficinas em que está vinculado.
  const meuVinculo = vinculos.find((v) => v.voluntarioId === usuario?.voluntarioId);
  if (!coordenador && !meuVinculo) return <SemPermissao />;

  const nome = (vid: string) => voluntarios.find((v) => v.id === vid)?.nome ?? 'Voluntário';
  const totalCriancas = atendimentos.reduce((s, a) => s + a.quantidade, 0);

  async function acao(fn: () => Promise<unknown>) {
    setErro(null);
    try { await fn(); await carregar(); } catch (e) { setErro(e instanceof Error ? e.message : 'Algo deu errado.'); }
  }

  async function excluir() {
    if (!oficina || !confirm(`Excluir a oficina "${oficina.tema}"? Os vínculos e atendimentos dela também serão removidos.`)) return;
    await oficinasApi.excluir(id);
    router.replace('/oficinas');
  }

  const livres = voluntarios.filter((v) => v.status === 'ATIVO' && !vinculos.some((x) => x.voluntarioId === v.id));

  return (
    <>
      <Link href="/oficinas" className="mb-3 inline-block text-sm text-blue-700 underline-offset-2 hover:underline">← Oficinas</Link>
      <PageHeader
        titulo={oficina.tema}
        descricao={`${dataBR(oficina.data)}${oficina.horaInicio ? ` às ${oficina.horaInicio}` : ''} · ${horasBR(oficina.horas)}${oficina.local ? ` · ${oficina.local}` : ''}`}
        acao={coordenador && (
          <div className="flex gap-2">
            <Link href={`/oficinas/${id}/editar`} className="btn-ghost">Editar</Link>
            <button className="btn-danger" onClick={excluir}>Excluir</button>
          </div>
        )}
      />
      <Erro mensagem={erro} />

      <div className="mt-4 grid gap-6 xl:grid-cols-2">
        <section className="card xl:col-span-2">
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div><dt className="text-blue-700">Professor(a) responsável</dt><dd className="font-semibold text-blue-900">{oficina.professor}</dd></div>
            <div><dt className="text-blue-700">Voluntários</dt><dd className="font-display text-2xl font-bold text-blue-800">{vinculos.length}</dd></div>
            <div><dt className="text-blue-700">Crianças atendidas</dt><dd className="font-display text-2xl font-bold text-orange-600">{totalCriancas}</dd></div>
          </dl>
          {oficina.descricao && <p className="mt-4 border-t border-blue-100 pt-4 text-sm text-blue-900">{oficina.descricao}</p>}
        </section>

        <section className="card" aria-labelledby="h-vinculos">
          <h2 id="h-vinculos" className="mb-3 text-lg font-semibold text-blue-900">Voluntários vinculados</h2>
          {!coordenador && meuVinculo && (
            <p className="text-sm text-blue-900">Seu papel: <strong>{rotuloPapel(meuVinculo.papel)}</strong> · <strong>{horasBR(meuVinculo.horas)}</strong> contadas no seu termo.</p>
          )}
          {coordenador && (
            <>
              {vinculos.length === 0 && <p className="mb-3 text-sm text-blue-700">Ninguém vinculado ainda.</p>}
              <ul className="divide-y divide-blue-100">
                {vinculos.map((v) => <LinhaVinculo key={v.id} v={v} nome={nome(v.voluntarioId)} maximo={oficina.horas}
                  onSalvar={(papel, horas) => acao(() => vinculosApi.editar(v.id, papel, horas))}
                  onRemover={() => confirm(`Remover ${nome(v.voluntarioId)} desta oficina?`) && acao(() => vinculosApi.remover(v.id))} />)}
              </ul>
              <FormVinculo oficina={oficina} livres={livres} onVincular={(vol, papel, horas) => acao(() => vinculosApi.criar(oficina, vol, papel, horas))} />
            </>
          )}
        </section>

        <section className="card" aria-labelledby="h-atend">
          <h2 id="h-atend" className="mb-3 text-lg font-semibold text-blue-900">Atendimentos</h2>
          {atendimentos.length === 0 && <p className="mb-3 text-sm text-blue-700">Nenhum atendimento registrado.</p>}
          <ul className="divide-y divide-blue-100">
            {atendimentos.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                <span>
                  <span className="font-semibold text-blue-900">{a.instituicao}</span>
                  {a.observacao && <span className="block text-blue-600">{a.observacao}</span>}
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="font-semibold text-blue-800">{a.quantidade} {a.quantidade === 1 ? 'criança' : 'crianças'}</span>
                  {coordenador && <button className="text-red-700 underline-offset-2 hover:underline" aria-label={`Remover atendimento de ${a.instituicao}`} onClick={() => confirm('Remover este atendimento?') && acao(() => atendimentosApi.remover(a.id))}>Remover</button>}
                </span>
              </li>
            ))}
          </ul>
          {coordenador && <FormAtendimento onRegistrar={(dto) => acao(() => atendimentosApi.registrar({ ...dto, oficinaId: id }))} />}
        </section>
      </div>
    </>
  );
}

function LinhaVinculo({ v, nome, maximo, onSalvar, onRemover }: { v: Vinculo; nome: string; maximo: number; onSalvar: (p: PapelVinculo, h: number) => void; onRemover: () => void }) {
  const [papel, setPapel] = useState(v.papel);
  const [horas, setHoras] = useState(v.horas);
  const alterado = papel !== v.papel || horas !== v.horas;
  return (
    <li className="flex flex-wrap items-end gap-3 py-3">
      <span className="min-w-40 flex-1 text-sm font-semibold text-blue-900">{nome}</span>
      <label className="text-xs text-blue-700">Papel
        <select className="input mt-1 !py-1.5" value={papel} onChange={(e) => setPapel(e.target.value as PapelVinculo)}>
          {PAPEIS.map((p) => <option key={p.valor} value={p.valor}>{p.rotulo}</option>)}
        </select>
      </label>
      <label className="text-xs text-blue-700">Horas
        <input className="input mt-1 !w-20 !py-1.5" type="number" min={0.5} max={maximo} step={0.5} value={horas} onChange={(e) => setHoras(Number(e.target.value))} />
      </label>
      {alterado && <button className="btn-primary !py-1.5" onClick={() => onSalvar(papel, horas)}>Salvar</button>}
      <button className="text-sm text-red-700 underline-offset-2 hover:underline" aria-label={`Remover ${nome}`} onClick={onRemover}>Remover</button>
    </li>
  );
}

function FormVinculo({ oficina, livres, onVincular }: { oficina: Oficina; livres: Voluntario[]; onVincular: (v: Voluntario, p: PapelVinculo, h: number) => void }) {
  const [vid, setVid] = useState('');
  const [papel, setPapel] = useState<PapelVinculo>('TUTOR');
  const [horas, setHoras] = useState(oficina.horas);
  if (livres.length === 0) return <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">Não há voluntários ativos disponíveis para vincular.</p>;
  return (
    <form className="mt-4 flex flex-wrap items-end gap-3 rounded-xl bg-blue-50 p-4" onSubmit={(e) => {
      e.preventDefault();
      const vol = livres.find((x) => x.id === vid);
      if (vol) { onVincular(vol, papel, horas); setVid(''); }
    }}>
      <div className="min-w-48 flex-1"><Field label="Vincular voluntário">
        <select className="input" required value={vid} onChange={(e) => setVid(e.target.value)}>
          <option value="">Selecione…</option>
          {livres.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
        </select></Field></div>
      <Field label="Papel"><select className="input" value={papel} onChange={(e) => setPapel(e.target.value as PapelVinculo)}>{PAPEIS.map((p) => <option key={p.valor} value={p.valor}>{p.rotulo}</option>)}</select></Field>
      <div className="w-24"><Field label="Horas"><input className="input" type="number" min={0.5} max={oficina.horas} step={0.5} value={horas} onChange={(e) => setHoras(Number(e.target.value))} /></Field></div>
      <button className="btn-accent">Vincular</button>
    </form>
  );
}

function FormAtendimento({ onRegistrar }: { onRegistrar: (dto: { instituicao: string; quantidade: number; observacao: string }) => void }) {
  const [instituicao, setInstituicao] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState('');
  return (
    <form className="mt-4 grid gap-3 rounded-xl bg-blue-50 p-4 sm:grid-cols-[1fr_6rem]" onSubmit={(e) => {
      e.preventDefault();
      onRegistrar({ instituicao, quantidade, observacao });
      setInstituicao(''); setQuantidade(1); setObservacao('');
    }}>
      <Field label="Instituição (escola, ONG, creche)"><input className="input" required value={instituicao} onChange={(e) => setInstituicao(e.target.value)} /></Field>
      <Field label="Crianças"><input className="input" type="number" min={1} step={1} required value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} /></Field>
      <div className="sm:col-span-2"><Field label="Observação (opcional)"><input className="input" value={observacao} onChange={(e) => setObservacao(e.target.value)} /></Field></div>
      <button className="btn-accent sm:col-span-2">Registrar atendimento</button>
    </form>
  );
}
