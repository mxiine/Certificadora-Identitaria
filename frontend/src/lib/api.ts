import { API_URL } from './config';
import type {
  EditarVoluntario, LoginResponse, NovoVoluntario, StatusVoluntario, Voluntario,
} from './types';

export const SESSION_KEY = 'trama.session';
export const UNAUTHORIZED_EVENT = 'trama:unauthorized';

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw).token as string) : null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Verifique se a API está no ar.', 0);
  }

  if (!res.ok) {
    // O NestJS devolve { message: string | string[], statusCode }
    let message = 'Algo deu errado. Tente novamente.';
    try {
      const body = await res.json();
      message = Array.isArray(body.message) ? body.message.join(' · ') : body.message ?? message;
    } catch {}
    if (res.status === 401 && token && typeof window !== 'undefined') {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    if (res.status === 403) message = 'Você não tem permissão para fazer isso.';
    throw new ApiError(message, res.status);
  }
  return res.json() as Promise<T>;
}

export const api = {
  login: (email: string, senha: string) =>
    request<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) }),

  listarVoluntarios: (status?: StatusVoluntario) =>
    request<Voluntario[]>(`/voluntarios${status ? `?status=${status}` : ''}`),
  buscarVoluntario: (id: string) => request<Voluntario>(`/voluntarios/${id}`),
  criarVoluntario: (dto: NovoVoluntario) =>
    request<Voluntario>('/voluntarios', { method: 'POST', body: JSON.stringify(dto) }),
  editarVoluntario: (id: string, dto: EditarVoluntario) =>
    request<Voluntario>(`/voluntarios/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),
  desligarVoluntario: (id: string) =>
    request<Voluntario>(`/voluntarios/${id}/desligar`, { method: 'PATCH' }),
};
