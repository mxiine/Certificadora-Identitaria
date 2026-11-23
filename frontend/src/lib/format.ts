export const dataBR = (iso?: string | null) =>
  iso ? new Date(iso.slice(0, 10) + 'T12:00:00').toLocaleDateString('pt-BR') : '—';

export const horasBR = (h: number) =>
  `${Number.isInteger(h) ? h : h.toFixed(1).replace('.', ',')} h`;

export const hoje = () => new Date().toISOString().slice(0, 10);
