import {
    ConflictException,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { PerfilUsuario, StatusVoluntario } from '@prisma/client';
import { AuthUser } from '../../common/types/auth-user';
import { VoluntariosService } from './voluntarios.service';

jest.mock('bcrypt', () => ({ hash: jest.fn(), compare: jest.fn() }));

describe('VoluntariosService', () => {
    const coordenador: AuthUser = {
        id: 'u0',
        email: 'coord@ellp.utfpr.edu.br',
        perfil: PerfilUsuario.COORDENADOR,
        voluntarioId: null,
    };
    const voluntario: AuthUser = {
        id: 'u1',
        email: 'ana@teste.com',
        perfil: PerfilUsuario.VOLUNTARIO,
        voluntarioId: 'v1',
    };

    let repository: { findById: jest.Mock; findAll: jest.Mock; update: jest.Mock };
    let prisma: { usuario: { findUnique: jest.Mock } };
    let service: VoluntariosService;

    beforeEach(() => {
        repository = { findById: jest.fn(), findAll: jest.fn(), update: jest.fn() };
        prisma = { usuario: { findUnique: jest.fn() } };
        service = new VoluntariosService(repository as never, prisma as never);
    });

    describe('findOneForUser', () => {
        it('coordenador lê o cadastro de qualquer voluntário', async () => {
            repository.findById.mockResolvedValue({ id: 'v2' });

            await expect(service.findOneForUser('v2', coordenador)).resolves.toEqual({ id: 'v2' });
        });

        it('voluntário lê o próprio cadastro', async () => {
            repository.findById.mockResolvedValue({ id: 'v1' });

            await expect(service.findOneForUser('v1', voluntario)).resolves.toEqual({ id: 'v1' });
        });

        it('voluntário não lê o cadastro de outro voluntário (403)', async () => {
            await expect(service.findOneForUser('v2', voluntario)).rejects.toBeInstanceOf(
                ForbiddenException,
            );
            expect(repository.findById).not.toHaveBeenCalled();
        });

        it('devolve 404 quando o voluntário não existe', async () => {
            repository.findById.mockResolvedValue(null);

            await expect(service.findOneForUser('v9', coordenador)).rejects.toBeInstanceOf(
                NotFoundException,
            );
        });
    });

    describe('desligar', () => {
        it('muda o status para INATIVO e registra a data de saída', async () => {
            repository.findById.mockResolvedValue({ id: 'v1' });
            repository.update.mockResolvedValue({ id: 'v1', status: StatusVoluntario.INATIVO });

            await service.desligar('v1');

            expect(repository.update).toHaveBeenCalledWith('v1', {
                status: 'INATIVO',
                dataSaida: expect.any(Date),
            });
        });

        it('devolve 404 se o voluntário não existe', async () => {
            repository.findById.mockResolvedValue(null);

            await expect(service.desligar('v9')).rejects.toBeInstanceOf(NotFoundException);
            expect(repository.update).not.toHaveBeenCalled();
        });
    });

    describe('create', () => {
        it('recusa e-mail que já está em uso (409)', async () => {
            prisma.usuario.findUnique.mockResolvedValue({ id: 'u9' });

            await expect(
                service.create({
                    nome: 'Ana Lima',
                    curso: 'ADS',
                    contato: '43999990000',
                    dataEntrada: '2026-10-01',
                    email: 'ana@teste.com',
                    senha: '123456',
                }),
            ).rejects.toBeInstanceOf(ConflictException);
        });
    });
});