'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge, Carregando, Erro, Field, PageHeader } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { dataBR, horasBR } from '@/lib/format';
import { horasDoVoluntario, rotuloPapel, vinculosApi } from '@/lib/oficinas';
import { baixarTermo } from '@/lib/termo';
import type { Oficina, Vinculo, Voluntario } from '@/lib/types';

export default function DetalheVoluntario() {
  const { id } = useParams<{ id: string }>();
  const [v, setV] = useState<Voluntario | null>(null);
  const [itens, setItens] = useState<{ vinculo: Vinculo; oficina: Oficina }[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ nome: '', curso: '', contato: '', dataEntrada: '' });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    vinculosApi.doVoluntario(id).then(setItens);
    api.buscarVoluntario(id).then(setV).catch((e: ApiError) => setErro(e.message));
  }, [id]);

  function abrirEdicao() {
    if (!v) return;
    setForm({ nome: v.nome, curso: v.curso, contato: v.contato, dataEntrada: v.dataEntrada.slice(0, 10) });
    setEditando(true);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      setV(await api.editarVoluntario(id, form));
      setEditando(false);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  }

  async function desligar() {
    if (!v || !confirm(`Desligar ${v.nome}? A data de saída será registrada como hoje.`)) return;
    setErro(null);
    try {
      setV(await api.desligarVoluntario(id));
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível desligar.');
    }
  }

  if (!v) return erro ? <Erro mensagem={erro} /> : <Carregando />;
  const oficinas = itens.map((i) => i.oficina);
  const horas = horasDoVoluntario(v, itens.map((i) => i.vinculo));
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <Link href="/voluntarios" className="mb-3 inline-block text-sm text-blue-700 underline-offset-2 hover:underline">← Voluntários</Link>
      <PageHeader
        titulo={v.nome}
        descricao={v.curso}
        acao={
          <div className="flex flex-wrap gap-2">
            <button className="btn-accent" onClick={() => baixarTermo(v, oficinas, horas)}>Baixar termo (PDF)</button>
            {!editando && <button className="btn-ghost" onClick={abrirEdicao}>Editar dados</button>}
            {v.status === 'ATIVO' && <button className="btn-danger" onClick={desligar}>Desligar</button>}
          </div>
        }
      />
      <Erro mensagem={erro} />

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="card">
          {editando ? (
            <form onSubmit={salvar} className="space-y-4">
              <Field label="Nome completo"><input className="input" required minLength={3} value={form.nome} onChange={set('nome')} /></Field>
              <Field label="Curso"><input className="input" required value={form.curso} onChange={set('curso')} /></Field>
              <Field label="Contato"><input className="input" required value={form.contato} onChange={set('contato')} /></Field>
              <Field label="Data de entrada"><input className="input" type="date" required value={form.dataEntrada} onChange={set('dataEntrada')} /></Field>
              <div className="flex gap-3">
                <button className="btn-primary" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar alterações'}</button>
                <button type="button" className="btn-ghost" onClick={() => setEditando(false)}>Cancelar</button>
              </div>
            </form>
          ) : (
            <dl className="space-y-4 text-sm">
              <div className="flex items-center justify-between"><dt className="text-blue-700">Situação</dt><dd><Badge ativo={v.status === 'ATIVO'} /></dd></div>
              <div className="flex justify-between"><dt className="text-blue-700">Contato</dt><dd className="font-medium">{v.contato}</dd></div>
              <div className="flex justify-between"><dt className="text-blue-700">Entrada</dt><dd className="font-medium">{dataBR(v.dataEntrada)}</dd></div>
              <div className="flex justify-between"><dt className="text-blue-700">Saída</dt><dd className="font-medium">{dataBR(v.dataSaida)}</dd></div>
              <div className="flex justify-between border-t border-blue-100 pt-4"><dt className="text-blue-700">Carga horária total</dt><dd className="font-display text-2xl font-bold text-blue-800">{horasBR(horas)}</dd></div>
            </dl>
          )}
        </section>

        <section className="card">
          <h2 className="mb-3 text-lg font-semibold text-blue-900">Oficinas em que atuou</h2>
          {oficinas.length === 0 ? (
            <p className="text-sm text-blue-700">Nenhuma oficina vinculada ainda. Vincule este voluntário ao registrar uma oficina.</p>
          ) : (
            <ul className="divide-y divide-blue-100">
              {itens.map(({ oficina: o, vinculo }) => (
                <li key={o.id} className="flex justify-between gap-3 py-2.5 text-sm">
                  <span><Link href={`/oficinas/${o.id}`} className="font-semibold text-blue-900 underline-offset-2 hover:underline">{o.tema}</Link><span className="block text-blue-600">{dataBR(o.data)} · {rotuloPapel(vinculo.papel)}</span></span>
                  <span className="shrink-0 text-blue-700">{horasBR(vinculo.horas)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
