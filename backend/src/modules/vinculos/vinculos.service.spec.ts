import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { PapelVinculo, PerfilUsuario, StatusVoluntario } from '@prisma/client';
import { AuthUser } from '../../common/types/auth-user';
import { VinculosService } from './vinculos.service';

describe('VinculosService', () => {
    const oficina = { id: 'of1', data: new Date('2026-11-14'), horas: 4 };
    const voluntarioAtivo = {
        id: 'v1',
        status: StatusVoluntario.ATIVO,
        dataEntrada: new Date('2026-10-01'),
        dataSaida: null,
    };
    const dto = { voluntarioId: 'v1', papel: PapelVinculo.TUTOR, horas: 3 };

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

    let repository: {
        findByOficina: jest.Mock;
        findByVoluntario: jest.Mock;
        findById: jest.Mock;
        findByOficinaEVoluntario: jest.Mock;
    };
    let oficinasRepository: { findById: jest.Mock };
    let voluntariosRepository: { findById: jest.Mock; recalcularCargaHoraria: jest.Mock };
    let tx: { vinculo: { create: jest.Mock; update: jest.Mock; delete: jest.Mock } };
    let prisma: { $transaction: jest.Mock };
    let service: VinculosService;

    beforeEach(() => {
        repository = {
            findByOficina: jest.fn(),
            findByVoluntario: jest.fn(),
            findById: jest.fn(),
            findByOficinaEVoluntario: jest.fn().mockResolvedValue(null),
        };
        oficinasRepository = { findById: jest.fn().mockResolvedValue(oficina) };
        voluntariosRepository = {
            findById: jest.fn().mockResolvedValue(voluntarioAtivo),
            recalcularCargaHoraria: jest.fn(),
        };
        tx = {
            vinculo: {
                create: jest.fn().mockResolvedValue({ id: 'vin1' }),
                update: jest.fn().mockResolvedValue({ id: 'vin1' }),
                delete: jest.fn().mockResolvedValue({ id: 'vin1' }),
            },
        };
        prisma = {
            $transaction: jest.fn((callback: (client: typeof tx) => unknown) => callback(tx)),
        };
        service = new VinculosService(
            repository as never,
            oficinasRepository as never,
            voluntariosRepository as never,
            prisma as never,
        );
    });

    describe('criar', () => {
        it('cria o vínculo e recalcula a carga horária do voluntário', async () => {
            await service.criar('of1', dto);

            expect(tx.vinculo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { oficinaId: 'of1', voluntarioId: 'v1', papel: 'TUTOR', horas: 3 },
                }),
            );
            expect(voluntariosRepository.recalcularCargaHoraria).toHaveBeenCalledWith('v1', tx);
        });

        it('regra 1: recusa voluntário já vinculado à oficina (409)', async () => {
            repository.findByOficinaEVoluntario.mockResolvedValue({ id: 'existente' });

            await expect(service.criar('of1', dto)).rejects.toBeInstanceOf(ConflictException);
            expect(tx.vinculo.create).not.toHaveBeenCalled();
        });

        it('regra 2: recusa voluntário inativo', async () => {
            voluntariosRepository.findById.mockResolvedValue({
                ...voluntarioAtivo,
                status: StatusVoluntario.INATIVO,
            });

            await expect(service.criar('of1', dto)).rejects.toBeInstanceOf(BadRequestException);
        });

        it('regra 3: recusa oficina antes da entrada do voluntário', async () => {
            voluntariosRepository.findById.mockResolvedValue({
                ...voluntarioAtivo,
                dataEntrada: new Date('2026-12-01'),
            });

            await expect(service.criar('of1', dto)).rejects.toBeInstanceOf(BadRequestException);
        });

        it('regra 4: recusa horas maiores que a duração da oficina', async () => {
            await expect(service.criar('of1', { ...dto, horas: 5 })).rejects.toBeInstanceOf(
                BadRequestException,
            );
        });

        it('regra 4: aceita horas iguais à duração da oficina', async () => {
            await expect(service.criar('of1', { ...dto, horas: 4 })).resolves.toBeDefined();
        });

        it('regra 4: recusa horas zeradas', async () => {
            await expect(service.criar('of1', { ...dto, horas: 0 })).rejects.toBeInstanceOf(
                BadRequestException,
            );
        });

        it('devolve 404 se a oficina ou o voluntário não existem', async () => {
            oficinasRepository.findById.mockResolvedValue(null);
            await expect(service.criar('of9', dto)).rejects.toBeInstanceOf(NotFoundException);

            oficinasRepository.findById.mockResolvedValue(oficina);
            voluntariosRepository.findById.mockResolvedValue(null);
            await expect(service.criar('of1', dto)).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('atualizar', () => {
        it('recusa horas acima da duração da oficina do vínculo', async () => {
            repository.findById.mockResolvedValue({
                id: 'vin1',
                voluntarioId: 'v1',
                oficina: { horas: 4 },
            });

            await expect(service.atualizar('vin1', { horas: 6 })).rejects.toBeInstanceOf(
                BadRequestException,
            );
        });

        it('atualiza e recalcula a carga horária do voluntário do vínculo', async () => {
            repository.findById.mockResolvedValue({
                id: 'vin1',
                voluntarioId: 'v1',
                oficina: { horas: 4 },
            });

            await service.atualizar('vin1', { horas: 2 });

            expect(tx.vinculo.update).toHaveBeenCalled();
            expect(voluntariosRepository.recalcularCargaHoraria).toHaveBeenCalledWith('v1', tx);
        });
    });

    describe('remover', () => {
        it('remove e recalcula a carga horária', async () => {
            repository.findById.mockResolvedValue({ id: 'vin1', voluntarioId: 'v1' });

            await service.remover('vin1');

            expect(tx.vinculo.delete).toHaveBeenCalledWith({ where: { id: 'vin1' } });
            expect(voluntariosRepository.recalcularCargaHoraria).toHaveBeenCalledWith('v1', tx);
        });

        it('devolve 404 se o vínculo não existe', async () => {
            repository.findById.mockResolvedValue(null);

            await expect(service.remover('vin9')).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('listagens', () => {
        it('voluntário vê só o próprio vínculo na oficina', async () => {
            await service.listarPorOficina('of1', voluntario);

            expect(repository.findByOficina).toHaveBeenCalledWith('of1', 'v1');
        });

        it('coordenador vê todos os vínculos da oficina', async () => {
            await service.listarPorOficina('of1', coordenador);

            expect(repository.findByOficina).toHaveBeenCalledWith('of1');
        });

        it('voluntário não vê o histórico de outro voluntário (403)', async () => {
            await expect(service.listarPorVoluntario('v2', voluntario)).rejects.toBeInstanceOf(
                ForbiddenException,
            );
        });

        it('voluntário vê o próprio histórico', async () => {
            await service.listarPorVoluntario('v1', voluntario);

            expect(repository.findByVoluntario).toHaveBeenCalledWith('v1');
        });
    });
});