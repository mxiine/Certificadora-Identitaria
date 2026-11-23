import { horasBR } from '@/lib/format';

/* Gráfico de barras em SVG. Acessível: role="img" + tabela equivalente só para leitores de tela. */
export function GraficoBarras({ titulo, itens, sufixo = '' }: { titulo: string; itens: { rotulo: string; valor: number }[]; sufixo?: string }) {
  const max = Math.max(1, ...itens.map((i) => i.valor));
  return (
    <figure>
      <svg viewBox="0 0 400 200" role="img" aria-label={`${titulo}: ${itens.map((i) => `${i.rotulo} ${i.valor}${sufixo}`).join(', ')}`} className="h-52 w-full">
        <line x1="0" y1="170" x2="400" y2="170" stroke="#DCE8FF" strokeWidth="2" />
        {itens.map((i, idx) => {
          const h = (i.valor / max) * 140;
          const largura = Math.min(44, (400 / itens.length) * 0.6);
          const x = (400 / itens.length) * idx + (400 / itens.length - largura) / 2;
          return (
            <g key={i.rotulo}>
              <rect x={x} y={170 - h} width={largura} height={h} rx="5" fill="#FF8A1F" />
              <text x={x + largura / 2} y={162 - h} textAnchor="middle" fontSize="13" fontWeight="700" fill="#163B93">{i.valor}</text>
              <text x={x + largura / 2} y="190" textAnchor="middle" fontSize="12" fill="#2A63DB">{i.rotulo}</text>
            </g>
          );
        })}
      </svg>
      <table className="sr-only">
        <caption>{titulo}</caption>
        <thead><tr><th scope="col">Período</th><th scope="col">Quantidade</th></tr></thead>
        <tbody>{itens.map((i) => <tr key={i.rotulo}><th scope="row">{i.rotulo}</th><td>{i.valor}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}

/* Ranking (lista ordenada) com barras proporcionais e posição em texto, sem depender só de cor. */
export function Ranking({ itens }: { itens: { nome: string; horas: number }[] }) {
  const max = Math.max(1, ...itens.map((i) => i.horas));
  return (
    <ol className="space-y-3">
      {itens.map((r, idx) => (
        <li key={r.nome} className="flex items-center gap-3">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ${idx === 0 ? 'bg-orange-500 text-blue-950' : 'bg-blue-100 text-blue-800'}`}>
            <span className="sr-only">Posição </span>{idx + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex justify-between gap-2 text-sm">
              <span className="truncate font-medium text-blue-900">{r.nome}</span>
              <span className="shrink-0 font-semibold text-blue-700">{horasBR(r.horas)}</span>
            </div>
            <div className="h-2.5 rounded-full bg-blue-100" aria-hidden>
              <div className={`h-full rounded-full ${idx === 0 ? 'bg-orange-500' : 'bg-blue-600'}`} style={{ width: `${(r.horas / max) * 100}%` }} />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
