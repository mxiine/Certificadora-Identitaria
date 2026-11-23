export type Perfil = 'COORDENADOR' | 'VOLUNTARIO';
export type StatusVoluntario = 'ATIVO' | 'INATIVO';

export interface Usuario {
  id: string;
  email: string;
  perfil: Perfil;
  /** Só vem se o back-end devolver no login (ver BACKEND-PATCH.md). */
  voluntarioId?: string | null;
}

export interface LoginResponse {
  accessToken: string;
  usuario: Usuario;
}

export interface Voluntario {
  id: string;
  nome: string;
  curso: string;
  contato: string;
  dataEntrada: string;
  dataSaida: string | null;
  status: StatusVoluntario;
  cargaHorariaTotal: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface NovoVoluntario {
  nome: string;
  curso: string;
  contato: string;
  dataEntrada: string;
  email?: string;
  senha?: string;
}

export type EditarVoluntario = Partial<Omit<NovoVoluntario, 'email' | 'senha'>>;

export type PapelVinculo = 'TUTOR' | 'MONITOR' | 'APOIO';

export interface Oficina {
  id: string;
  tema: string;
  descricao: string;
  data: string; // yyyy-mm-dd
  horaInicio: string; // hh:mm ou ''
  horas: number; // duração
  local: string;
  professor: string;
}
export type NovaOficina = Omit<Oficina, 'id'>;

/** Vínculo N:N entre voluntário e oficina, com papel e horas computadas. */
export interface Vinculo {
  id: string;
  oficinaId: string;
  voluntarioId: string;
  papel: PapelVinculo;
  horas: number;
}

/** Registro de atendimento: quantas crianças de qual instituição passaram pela oficina. */
export interface Atendimento {
  id: string;
  oficinaId: string;
  instituicao: string;
  quantidade: number;
  observacao: string;
}
