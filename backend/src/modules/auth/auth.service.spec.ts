import { UnauthorizedException } from '@nestjs/common';
import { PerfilUsuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({ compare: jest.fn(), hash: jest.fn() }));

describe('AuthService', () => {
    const usuario = {
        id: 'u1',
        email: 'ana@teste.com',
        senhaHash: 'hash-da-senha',
        perfil: PerfilUsuario.VOLUNTARIO,
        voluntarioId: 'v1',
    };

    let prisma: { usuario: { findUnique: jest.Mock } };
    let jwtService: { signAsync: jest.Mock };
    let service: AuthService;

    beforeEach(() => {
        prisma = { usuario: { findUnique: jest.fn() } };
        jwtService = { signAsync: jest.fn().mockResolvedValue('token-jwt') };
        service = new AuthService(prisma as never, jwtService as never);
    });

    it('devolve o token e o voluntarioId quando as credenciais são válidas', async () => {
        prisma.usuario.findUnique.mockResolvedValue(usuario);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        const resultado = await service.login({ email: usuario.email, senha: '123456' });

        expect(resultado.accessToken).toBe('token-jwt');
        expect(resultado.usuario).toEqual({
            id: 'u1',
            email: 'ana@teste.com',
            perfil: PerfilUsuario.VOLUNTARIO,
            voluntarioId: 'v1',
        });
        expect(jwtService.signAsync).toHaveBeenCalledWith(
            expect.objectContaining({ sub: 'u1', perfil: 'VOLUNTARIO', voluntarioId: 'v1' }),
        );
    });

    it('não expõe o hash da senha na resposta', async () => {
        prisma.usuario.findUnique.mockResolvedValue(usuario);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        const resultado = await service.login({ email: usuario.email, senha: '123456' });

        expect(JSON.stringify(resultado)).not.toContain('hash-da-senha');
    });

    it('recusa e-mail que não existe', async () => {
        prisma.usuario.findUnique.mockResolvedValue(null);

        await expect(
            service.login({ email: 'naoexiste@teste.com', senha: '123456' }),
        ).rejects.toBeInstanceOf(UnauthorizedException);
        expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('recusa senha errada', async () => {
        prisma.usuario.findUnique.mockResolvedValue(usuario);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        await expect(
            service.login({ email: usuario.email, senha: 'senha-errada' }),
        ).rejects.toBeInstanceOf(UnauthorizedException);
        expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
});