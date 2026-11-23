'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { DIAS_SEMANA, NOMES_MES, chaveData, gradeDoMes, mesAnterior, mesSeguinte } from '@/lib/calendario';
import { dataBR } from '@/lib/format';
import type { Oficina } from '@/lib/types';

/** Calendário mensal. Cada dia é um botão com rótulo falado ("12 de novembro, 2 oficinas"). */
export function Calendario({ oficinas }: { oficinas: Oficina[] }) {
  const agora = new Date();
  const [{ ano, mes }, setMes] = useState({ ano: agora.getFullYear(), mes: agora.getMonth() });
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const hojeChave = chaveData(agora.getFullYear(), agora.getMonth(), agora.getDate());

  const porDia = useMemo(() => {
    const m = new Map<string, Oficina[]>();
    for (const o of oficinas) m.set(o.data, [...(m.get(o.data) ?? []), o]);
    return m;
  }, [oficinas]);
  const semanas = gradeDoMes(ano, mes);
  const doDia = selecionado ? porDia.get(selecionado) ?? [] : [];
  const doMes = oficinas.filter((o) => o.data.startsWith(`${ano}-${String(mes + 1).padStart(2, '0')}`)).sort((a, b) => a.data.localeCompare(b.data));

  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <section className="card" aria-label="Calendário de oficinas">
        <div className="mb-4 flex items-center justify-between gap-2">
          <button className="btn-ghost !px-3" onClick={() => setMes(mesAnterior(ano, mes))} aria-label="Mês anterior">←</button>
          <h2 className="text-lg font-bold capitalize text-blue-900" aria-live="polite">{NOMES_MES[mes]} de {ano}</h2>
          <button className="btn-ghost !px-3" onClick={() => setMes(mesSeguinte(ano, mes))} aria-label="Próximo mês">→</button>
        </div>
        <table className="w-full table-fixed border-separate border-spacing-1 text-center">
          <thead>
            <tr>{DIAS_SEMANA.map((d) => <th key={d} scope="col" className="pb-1 text-xs font-semibold uppercase text-blue-600"><abbr title={d} className="no-underline">{d.slice(0, 3)}</abbr></th>)}</tr>
          </thead>
          <tbody>
            {semanas.map((sem, i) => (
              <tr key={i}>
                {sem.map((d) => {
                  const lista = porDia.get(d.chave) ?? [];
                  const ativo = selecionado === d.chave;
                  return (
                    <td key={d.chave} className="p-0">
                      <button
                        onClick={() => setSelecionado(ativo ? null : d.chave)}
                        aria-pressed={ativo}
                        aria-current={d.chave === hojeChave ? 'date' : undefined}
                        aria-label={`${d.dia} de ${NOMES_MES[Number(d.chave.slice(5, 7)) - 1]}${lista.length ? `, ${lista.length} ${lista.length === 1 ? 'oficina' : 'oficinas'}` : ''}`}
                        className={`relative flex h-11 w-full items-center justify-center rounded-lg text-sm sm:h-14 ${
                          ativo ? 'bg-blue-700 font-bold text-white' : d.doMes ? 'text-blue-900 hover:bg-blue-50' : 'text-blue-300 hover:bg-blue-50'
                        } ${d.chave === hojeChave && !ativo ? 'ring-2 ring-orange-500' : ''}`}
                      >
                        {d.dia}
                        {lista.length > 0 && (
                          <span className={`absolute bottom-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${ativo ? 'bg-orange-400 text-blue-950' : 'bg-orange-500 text-blue-950'}`}>{lista.length}</span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card" aria-live="polite">
        <h2 className="mb-3 text-lg font-semibold text-blue-900">{selecionado ? `Oficinas em ${dataBR(selecionado)}` : `Oficinas de ${NOMES_MES[mes]}`}</h2>
        {(selecionado ? doDia : doMes).length === 0 ? (
          <p className="text-sm text-blue-700">{selecionado ? 'Nenhuma oficina neste dia.' : 'Nenhuma oficina neste mês.'}</p>
        ) : (
          <ul className="divide-y divide-blue-100">
            {(selecionado ? doDia : doMes).map((o) => (
              <li key={o.id} className="py-3">
                <Link href={`/oficinas/${o.id}`} className="font-semibold text-blue-800 underline-offset-2 hover:underline">{o.tema}</Link>
                <p className="text-sm text-blue-600">{dataBR(o.data)}{o.horaInicio ? ` · ${o.horaInicio}` : ''} · {o.professor}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
