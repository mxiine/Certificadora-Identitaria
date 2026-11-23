import { PerfilUsuario } from '@prisma/client';

export interface AuthUser {
    id: string;
    email: string;
    perfil: PerfilUsuario;
    voluntarioId: string | null;
}