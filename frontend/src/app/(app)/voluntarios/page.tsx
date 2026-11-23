'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Badge, Carregando, Erro, PageHeader, Vazio } from '@/components/ui';
import { api } from '@/lib/api';
import { dataBR, horasBR } from '@/lib/format';
import { horasDoVoluntario, vinculosApi } from '@/lib/oficinas';
import type { StatusVoluntario, Vinculo, Voluntario } from '@/lib/types';

const FILTROS: { valor?: StatusVoluntario; rotulo: string }[] = [
  { rotulo: 'Todos' },
  { valor: 'ATIVO', rotulo: 'Ativos' },
  { valor: 'INATIVO', rotulo: 'Inativos' },
];

export default function Voluntarios() {
  const [status, setStatus] = useState<StatusVoluntario | undefined>();
  const [busca, setBusca] = useState('');
  const [lista, setLista] = useState<Voluntario[] | null>(null);
  const [vinculos, setVinculos] = useState<Vinculo[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => { vinculosApi.listar().then(setVinculos); }, []);
  useEffect(() => {
    setLista(null);
    setErro(null);
    api.listarVoluntarios(status).then(setLista).catch((e) => setErro(e.message));
  }, [status]);

  const filtrada = useMemo(
    () => lista?.filter((v) => v.nome.toLowerCase().includes(busca.trim().toLowerCase())) ?? [],
    [lista, busca],
  );

  return (
    <>
      <PageHeader
        titulo="Voluntários"
        descricao="Quem atua no ELLP, há quanto tempo e quantas horas já somou."
        acao={<Link href="/voluntarios/novo" className="btn-accent">Cadastrar voluntário</Link>}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Filtrar por situação" className="flex rounded-lg border border-blue-200 bg-white p-1">
          {FILTROS.map((f) => (
            <button
              key={f.rotulo}
              onClick={() => setStatus(f.valor)}
              aria-pressed={status === f.valor}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${status === f.valor ? 'bg-blue-700 text-white' : 'text-blue-800 hover:bg-blue-50'}`}
            >
              {f.rotulo}
            </button>
          ))}
        </div>
        <input className="input max-w-xs" type="search" placeholder="Buscar por nome" aria-label="Buscar por nome" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      <Erro mensagem={erro} />
      {!lista && !erro && <Carregando />}
      {lista && filtrada.length === 0 && (
        <Vazio
          titulo={busca ? 'Ninguém com esse nome' : 'Nenhum voluntário por aqui'}
          texto={busca ? 'Confira a grafia ou limpe a busca.' : 'Cadastre o primeiro voluntário para começar a acompanhar horas e oficinas.'}
          acao={!busca && <Link href="/voluntarios/novo" className="btn-primary">Cadastrar voluntário</Link>}
        />
      )}
      {filtrada.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-blue-100 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-blue-100/60 text-blue-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Curso</th>
                <th className="px-4 py-3 font-semibold">Entrada</th>
                <th className="px-4 py-3 font-semibold">Horas</th>
                <th className="px-4 py-3 font-semibold">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {filtrada.map((v) => (
                <tr key={v.id} className="hover:bg-blue-50">
                  <td className="px-4 py-3">
                    <Link href={`/voluntarios/${v.id}`} className="font-semibold text-blue-800 underline-offset-2 hover:underline">{v.nome}</Link>
                  </td>
                  <td className="px-4 py-3 text-blue-900">{v.curso}</td>
                  <td className="px-4 py-3 text-blue-900">{dataBR(v.dataEntrada)}</td>
                  <td className="px-4 py-3 text-blue-900">{horasBR(horasDoVoluntario(v, vinculos))}</td>
                  <td className="px-4 py-3"><Badge ativo={v.status === 'ATIVO'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
