'use client';

import { useEffect, useMemo, useState } from 'react';
import { GraficoBarras, Ranking } from '@/components/charts';
import { Carregando, Erro, Metrica, PageHeader, Vazio } from '@/components/ui';
import { api } from '@/lib/api';
import { horasBR } from '@/lib/format';
import { useDadosOficinas } from '@/lib/hooks';
import { horasDoVoluntario } from '@/lib/oficinas';
import type { Voluntario } from '@/lib/types';

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const PERIODOS = [
  { valor: 'tudo', rotulo: 'Todo o período' },
  { valor: '12', rotulo: 'Últimos 12 meses' },
  { valor: '6', rotulo: 'Últimos 6 meses' },
];

export default function Painel() {
  const { oficinas = [], vinculos = [], atendimentos = [], carregando } = useDadosOficinas();
  const [voluntarios, setVoluntarios] = useState<Voluntario[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState('tudo');

  useEffect(() => { api.listarVoluntarios().then(setVoluntarios).catch((e) => setErro(e.message)); }, []);

  const dados = useMemo(() => {
    if (!voluntarios || carregando) return null;
    let corte = '';
    if (periodo !== 'tudo') {
      const d = new Date();
      d.setMonth(d.getMonth() - Number(periodo));
      corte = d.toISOString().slice(0, 10);
    }
    const ofs = oficinas.filter((o) => o.data >= corte);
    const ids = new Set(ofs.map((o) => o.id));
    const vins = vinculos.filter((v) => ids.has(v.oficinaId));
    const atds = atendimentos.filter((a) => ids.has(a.oficinaId));

    const ranking = voluntarios
      .map((v) => ({ nome: v.nome, horas: periodo === 'tudo' ? horasDoVoluntario(v, vins) : vins.filter((x) => x.voluntarioId === v.id).reduce((s, x) => s + x.horas, 0) }))
      .filter((r) => r.horas > 0)
      .sort((a, b) => b.horas - a.horas)
      .slice(0, 8);

    const porMes = new Map<string, number>();
    for (const o of ofs) porMes.set(o.data.slice(0, 7), (porMes.get(o.data.slice(0, 7)) ?? 0) + 1);
    const meses = [...porMes.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-8).map(([m, n]) => ({ rotulo: `${MESES[Number(m.slice(5)) - 1]}/${m.slice(2, 4)}`, valor: n }));

    return {
      ativos: voluntarios.filter((v) => v.status === 'ATIVO').length,
      total: voluntarios.length,
      horas: vins.reduce((s, v) => s + v.horas, 0),
      oficinas: ofs.length,
      criancas: atds.reduce((s, a) => s + a.quantidade, 0),
      ranking, meses,
    };
  }, [voluntarios, carregando, oficinas, vinculos, atendimentos, periodo]);

  return (
    <>
      <PageHeader
        titulo="Painel de impacto"
        descricao="Os números do ELLP prontos para prestação de contas e divulgação."
        acao={
          <label className="text-sm text-blue-800">
            <span className="mr-2">Período</span>
            <select className="input !w-auto" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
              {PERIODOS.map((p) => <option key={p.valor} value={p.valor}>{p.rotulo}</option>)}
            </select>
          </label>
        }
      />
      <Erro mensagem={erro} />
      {!dados && !erro && <Carregando />}
      {dados && (
        <div aria-live="polite">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <Metrica destaque valor={dados.ativos} rotulo="voluntários ativos" />
            <Metrica valor={dados.total} rotulo="voluntários no histórico" />
            <Metrica valor={horasBR(dados.horas)} rotulo="horas de voluntariado" />
            <Metrica valor={dados.oficinas} rotulo="oficinas realizadas" />
            <Metrica valor={dados.criancas} rotulo="crianças atendidas" />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section className="card" aria-labelledby="g-oficinas">
              <h2 id="g-oficinas" className="mb-2 text-lg font-semibold text-blue-900">Oficinas por mês</h2>
              {dados.meses.length === 0
                ? <Vazio titulo="Sem oficinas no período" texto="Registre oficinas ou mude o período para ver o gráfico." />
                : <GraficoBarras titulo="Oficinas por mês" itens={dados.meses} />}
            </section>
            <section className="card" aria-labelledby="g-ranking">
              <h2 id="g-ranking" className="mb-4 text-lg font-semibold text-blue-900">Ranking de voluntários por carga horária</h2>
              {dados.ranking.length === 0
                ? <Vazio titulo="Sem horas registradas" texto="As horas aparecem quando voluntários são vinculados a oficinas." />
                : <Ranking itens={dados.ranking} />}
            </section>
          </div>
        </div>
      )}
    </>
  );
}
