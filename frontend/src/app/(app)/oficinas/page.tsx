'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Carregando, PageHeader, Vazio } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { dataBR, horasBR } from '@/lib/format';
import { useDadosOficinas } from '@/lib/hooks';
import { criancasDaOficina } from '@/lib/oficinas';

export default function Oficinas() {
  const { usuario } = useAuth();
  const { oficinas, vinculos, atendimentos, carregando } = useDadosOficinas();
  const [busca, setBusca] = useState('');
  const coordenador = usuario?.perfil === 'COORDENADOR';

  const filtradas = useMemo(
    () => (oficinas ?? []).filter((o) => `${o.tema} ${o.professor}`.toLowerCase().includes(busca.trim().toLowerCase())),
    [oficinas, busca],
  );

  return (
    <>
      <PageHeader
        titulo="Oficinas"
        descricao={coordenador ? 'Todas as oficinas do ELLP, com equipe e crianças atendidas.' : 'As oficinas em que você atuou.'}
        acao={coordenador && <Link href="/oficinas/nova" className="btn-accent">Nova oficina</Link>}
      />
      <input className="input mb-5 max-w-xs" type="search" placeholder="Buscar por tema ou professor" aria-label="Buscar oficinas" value={busca} onChange={(e) => setBusca(e.target.value)} />

      {carregando && <Carregando />}
      {!carregando && filtradas.length === 0 && (
        <Vazio
          titulo={busca ? 'Nenhuma oficina encontrada' : 'Nenhuma oficina por aqui'}
          texto={busca ? 'Confira a grafia ou limpe a busca.' : coordenador ? 'Registre a primeira oficina para montar o histórico.' : 'Quando a coordenação vincular você a uma oficina, ela aparece aqui.'}
          acao={coordenador && !busca && <Link href="/oficinas/nova" className="btn-primary">Nova oficina</Link>}
        />
      )}
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtradas.map((o) => (
          <li key={o.id} className="card flex flex-col">
            <p className="text-sm font-semibold text-orange-700">{dataBR(o.data)}{o.horaInicio ? ` · ${o.horaInicio}` : ''}</p>
            <h2 className="mt-1 text-lg font-bold text-blue-900">
              <Link href={`/oficinas/${o.id}`} className="underline-offset-2 hover:underline">{o.tema}</Link>
            </h2>
            <p className="text-sm text-blue-700">{o.professor} · {horasBR(o.horas)}</p>
            <p className="mt-auto pt-4 text-sm text-blue-800">
              <strong>{vinculos?.filter((v) => v.oficinaId === o.id).length ?? 0}</strong> voluntários ·{' '}
              <strong>{criancasDaOficina(atendimentos ?? [], o.id)}</strong> crianças
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
