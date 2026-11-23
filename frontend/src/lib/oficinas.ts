'use client';

/**
 * Camada de dados de Oficinas, Vínculos e Atendimentos.
 *
 * ATENÇÃO: o back-end ainda não tem esses módulos. Enquanto isso os dados ficam no
 * localStorage do navegador. TODAS as funções são assíncronas de propósito: quando a API
 * existir (contrato sugerido em API-OFICINAS.md), basta trocar o corpo de cada função por
 * uma chamada HTTP; nenhuma tela precisa mudar.
 */
import type { Atendimento, NovaOficina, Oficina, PapelVinculo, Vinculo, Voluntario } from './types';

interface Dados { oficinas: Oficina[]; vinculos: Vinculo[]; atendimentos: Atendimento[] }

const KEY = 'trama.dados.v2';
const KEY_V1 = 'trama.oficinas';

export const PAPEIS: { valor: PapelVinculo; rotulo: string }[] = [
  { valor: 'TUTOR', rotulo: 'Tutor(a)' },
  { valor: 'MONITOR', rotulo: 'Monitor(a)' },
  { valor: 'APOIO', rotulo: 'Apoio' },
];
export const rotuloPapel = (p: PapelVinculo) => PAPEIS.find((x) => x.valor === p)?.rotulo ?? p;

const uid = () => crypto.randomUUID();

function ler(): Dados {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Dados;
  } catch {}
  return migrarV1();
}

/** Converte o formato antigo (oficina com voluntarioIds e criancas) para o modelo novo. */
function migrarV1(): Dados {
  const dados: Dados = { oficinas: [], vinculos: [], atendimentos: [] };
  try {
    const antigas = JSON.parse(localStorage.getItem(KEY_V1) ?? '[]') as any[];
    for (const o of antigas) {
      dados.oficinas.push({ id: o.id, tema: o.tema, descricao: '', data: o.data, horaInicio: '', horas: o.horas, local: '', professor: o.professor });
      for (const vid of o.voluntarioIds ?? []) {
        dados.vinculos.push({ id: uid(), oficinaId: o.id, voluntarioId: vid, papel: 'TUTOR', horas: o.horas });
      }
      if (o.criancas > 0) {
        dados.atendimentos.push({ id: uid(), oficinaId: o.id, instituicao: 'Não informada', quantidade: o.criancas, observacao: '' });
      }
    }
  } catch {}
  return dados;
}
const gravar = (d: Dados) => localStorage.setItem(KEY, JSON.stringify(d));

/* ---------- Regras de associação voluntário ↔ oficina (função pura, testável) ---------- */
export function validarVinculo(
  oficina: Oficina,
  voluntario: Voluntario,
  existentes: Vinculo[],
  horas: number,
): string | null {
  if (existentes.some((v) => v.oficinaId === oficina.id && v.voluntarioId === voluntario.id))
    return `${voluntario.nome} já está vinculado(a) a esta oficina.`;
  if (voluntario.status !== 'ATIVO')
    return `${voluntario.nome} está inativo(a) e não pode ser vinculado(a) a novas oficinas.`;
  if (oficina.data < voluntario.dataEntrada.slice(0, 10))
    return 'A oficina é anterior à data de entrada do voluntário.';
  if (voluntario.dataSaida && oficina.data > voluntario.dataSaida.slice(0, 10))
    return 'A oficina é posterior à data de saída do voluntário.';
  if (!(horas > 0) || horas > oficina.horas)
    return `As horas devem ser maiores que 0 e no máximo ${oficina.horas} (duração da oficina).`;
  return null;
}

/* ---------- Oficinas ---------- */
export const oficinasApi = {
  async listar(): Promise<Oficina[]> {
    return ler().oficinas.sort((a, b) => b.data.localeCompare(a.data));
  },
  async buscar(id: string): Promise<Oficina | null> {
    return ler().oficinas.find((o) => o.id === id) ?? null;
  },
  async criar(dto: NovaOficina): Promise<Oficina> {
    const d = ler();
    const nova = { ...dto, id: uid() };
    d.oficinas.push(nova);
    gravar(d);
    return nova;
  },
  async editar(id: string, dto: NovaOficina): Promise<Oficina> {
    const d = ler();
    const i = d.oficinas.findIndex((o) => o.id === id);
    if (i < 0) throw new Error('Oficina não encontrada.');
    d.oficinas[i] = { ...dto, id };
    // horas de vínculo nunca passam da duração da oficina
    d.vinculos.filter((v) => v.oficinaId === id).forEach((v) => (v.horas = Math.min(v.horas, dto.horas)));
    gravar(d);
    return d.oficinas[i];
  },
  /** Remove a oficina e, em cascata, seus vínculos e atendimentos. */
  async excluir(id: string): Promise<void> {
    const d = ler();
    gravar({
      oficinas: d.oficinas.filter((o) => o.id !== id),
      vinculos: d.vinculos.filter((v) => v.oficinaId !== id),
      atendimentos: d.atendimentos.filter((a) => a.oficinaId !== id),
    });
  },
};

/* ---------- Vínculos ---------- */
export const vinculosApi = {
  async listar(): Promise<Vinculo[]> {
    return ler().vinculos;
  },
  async daOficina(oficinaId: string): Promise<Vinculo[]> {
    return ler().vinculos.filter((v) => v.oficinaId === oficinaId);
  },
  async doVoluntario(voluntarioId: string): Promise<{ vinculo: Vinculo; oficina: Oficina }[]> {
    const d = ler();
    return d.vinculos
      .filter((v) => v.voluntarioId === voluntarioId)
      .flatMap((vinculo) => {
        const oficina = d.oficinas.find((o) => o.id === vinculo.oficinaId);
        return oficina ? [{ vinculo, oficina }] : [];
      })
      .sort((a, b) => b.oficina.data.localeCompare(a.oficina.data));
  },
  async criar(oficina: Oficina, voluntario: Voluntario, papel: PapelVinculo, horas: number): Promise<Vinculo> {
    const d = ler();
    const erro = validarVinculo(oficina, voluntario, d.vinculos, horas);
    if (erro) throw new Error(erro);
    const novo: Vinculo = { id: uid(), oficinaId: oficina.id, voluntarioId: voluntario.id, papel, horas };
    d.vinculos.push(novo);
    gravar(d);
    return novo;
  },
  async editar(id: string, papel: PapelVinculo, horas: number): Promise<Vinculo> {
    const d = ler();
    const v = d.vinculos.find((x) => x.id === id);
    if (!v) throw new Error('Vínculo não encontrado.');
    const of = d.oficinas.find((o) => o.id === v.oficinaId);
    if (!of || !(horas > 0) || horas > of.horas) throw new Error(`As horas devem ser maiores que 0 e no máximo ${of?.horas ?? 0}.`);
    v.papel = papel;
    v.horas = horas;
    gravar(d);
    return v;
  },
  async remover(id: string): Promise<void> {
    const d = ler();
    gravar({ ...d, vinculos: d.vinculos.filter((v) => v.id !== id) });
  },
};

/* ---------- Atendimentos ---------- */
export const atendimentosApi = {
  async listar(): Promise<Atendimento[]> {
    return ler().atendimentos;
  },
  async daOficina(oficinaId: string): Promise<Atendimento[]> {
    return ler().atendimentos.filter((a) => a.oficinaId === oficinaId);
  },
  async registrar(dto: Omit<Atendimento, 'id'>): Promise<Atendimento> {
    if (!dto.instituicao.trim()) throw new Error('Informe a instituição atendida.');
    if (!Number.isInteger(dto.quantidade) || dto.quantidade < 1) throw new Error('A quantidade deve ser um número inteiro maior que 0.');
    const d = ler();
    const novo = { ...dto, instituicao: dto.instituicao.trim(), id: uid() };
    d.atendimentos.push(novo);
    gravar(d);
    return novo;
  },
  async remover(id: string): Promise<void> {
    const d = ler();
    gravar({ ...d, atendimentos: d.atendimentos.filter((a) => a.id !== id) });
  },
};

/* ---------- Agregações (usadas por painel, listas e termo) ---------- */
export const somaHoras = (vinculos: Vinculo[], voluntarioId: string) =>
  vinculos.filter((v) => v.voluntarioId === voluntarioId).reduce((s, v) => s + v.horas, 0);

/** Horas do voluntário: soma dos vínculos (ou o valor do back, se for maior). */
export const horasDoVoluntario = (v: Voluntario, vinculos: Vinculo[]) =>
  Math.max(somaHoras(vinculos, v.id), v.cargaHorariaTotal ?? 0);

export const criancasDaOficina = (atendimentos: Atendimento[], oficinaId: string) =>
  atendimentos.filter((a) => a.oficinaId === oficinaId).reduce((s, a) => s + a.quantidade, 0);
