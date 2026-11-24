import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PerfilUsuario } from '@prisma/client';
import { AuthUser } from '../../common/types/auth-user';
import { OficinasService } from './oficinas.service';

describe('OficinasService', () => {
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

    const oficinaDoBanco = () => ({
        id: 'of1',
        tema: 'Robótica com LEGO',
        data: new Date('2026-11-14'),
        horas: 4,
        atendimentos: [{ quantidade: 3 }, { quantidade: 5 }],
        _count: { vinculos: 2 },
    });

    let repository: {
        create: jest.Mock;
        findAll: jest.Mock;
        findById: jest.Mock;
        isVoluntarioVinculado: jest.Mock;
    };
    let voluntariosRepository: { recalcularCargaHoraria: jest.Mock };
    let tx: {
        oficina: { update: jest.Mock; delete: jest.Mock };
        vinculo: { findMany: jest.Mock; updateMany: jest.Mock };
    };
    let prisma: { vinculo: { findMany: jest.Mock }; $transaction: jest.Mock };
    let service: OficinasService;

    beforeEach(() => {
        repository = {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn().mockResolvedValue(oficinaDoBanco()),
            isVoluntarioVinculado: jest.fn(),
        };
        voluntariosRepository = { recalcularCargaHoraria: jest.fn() };
        tx = {
            oficina: { update: jest.fn(), delete: jest.fn().mockResolvedValue({ id: 'of1' }) },
            vinculo: { findMany: jest.fn().mockResolvedValue([]), updateMany: jest.fn() },
        };
        prisma = {
            vinculo: { findMany: jest.fn().mockResolvedValue([]) },
            $transaction: jest.fn((callback: (client: typeof tx) => unknown) => callback(tx)),
        };
        service = new OficinasService(
            repository as never,
            voluntariosRepository as never,
            prisma as never,
        );
    });

    describe('findAll', () => {
        it('coordenador vê todas as oficinas', async () => {
            repository.findAll.mockResolvedValue([oficinaDoBanco()]);

            const resultado = await service.findAll(coordenador);

            expect(repository.findAll).toHaveBeenCalledWith();
            expect(resultado).toHaveLength(1);
        });

        it('voluntário vê só as oficinas em que está vinculado', async () => {
            repository.findAll.mockResolvedValue([]);

            await service.findAll(voluntario);

            expect(repository.findAll).toHaveBeenCalledWith('v1');
        });

        it('voluntário sem cadastro vinculado ao login não vê nada (e nunca a lista toda)', async () => {
            const semCadastro: AuthUser = { ...voluntario, voluntarioId: null };

            await expect(service.findAll(semCadastro)).resolves.toEqual([]);
            expect(repository.findAll).not.toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('calcula totalCriancas (soma dos atendimentos) e totalVoluntarios', async () => {
            const oficina = await service.findOne('of1', coordenador);

            expect(oficina.totalCriancas).toBe(8);
            expect(oficina.totalVoluntarios).toBe(2);
            expect(oficina).not.toHaveProperty('atendimentos');
        });

        it('voluntário não vinculado recebe 403', async () => {
            repository.isVoluntarioVinculado.mockResolvedValue(false);

            await expect(service.findOne('of1', voluntario)).rejects.toBeInstanceOf(
                ForbiddenException,
            );
        });

        it('voluntário vinculado consegue ver a oficina', async () => {
            repository.isVoluntarioVinculado.mockResolvedValue(true);

            await expect(service.findOne('of1', voluntario)).resolves.toMatchObject({ id: 'of1' });
        });

        it('devolve 404 quando a oficina não existe', async () => {
            repository.findById.mockResolvedValue(null);

            await expect(service.findOne('of9', coordenador)).rejects.toBeInstanceOf(
                NotFoundException,
            );
        });
    });

    describe('update', () => {
        it('ao reduzir as horas, limita as horas dos vínculos e recalcula a carga dos voluntários', async () => {
            tx.vinculo.findMany.mockResolvedValue([{ voluntarioId: 'v1' }]);

            await service.update('of1', { horas: 2 });

            expect(tx.vinculo.updateMany).toHaveBeenCalledWith({
                where: { oficinaId: 'of1', horas: { gt: 2 } },
                data: { horas: 2 },
            });
            expect(voluntariosRepository.recalcularCargaHoraria).toHaveBeenCalledWith('v1', tx);
        });

        it('não mexe nos vínculos se nenhum passa do novo limite', async () => {
            tx.vinculo.findMany.mockResolvedValue([]);

            await service.update('of1', { horas: 6 });

            expect(tx.vinculo.updateMany).not.toHaveBeenCalled();
            expect(voluntariosRepository.recalcularCargaHoraria).not.toHaveBeenCalled();
        });

        it('recusa nova data que deixa um voluntário vinculado fora do seu período', async () => {
            prisma.vinculo.findMany.mockResolvedValue([
                {
                    voluntario: {
                        nome: 'Ana Lima',
                        dataEntrada: new Date('2026-12-01'),
                        dataSaida: null,
                    },
                },
            ]);

            await expect(service.update('of1', { data: '2026-11-14' })).rejects.toBeInstanceOf(
                BadRequestException,
            );
            expect(prisma.$transaction).not.toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        it('apaga a oficina e recalcula a carga horária de cada voluntário que estava vinculado', async () => {
            tx.vinculo.findMany.mockResolvedValue([{ voluntarioId: 'v1' }, { voluntarioId: 'v2' }]);

            await service.remove('of1');

            expect(tx.oficina.delete).toHaveBeenCalledWith({ where: { id: 'of1' } });
            expect(voluntariosRepository.recalcularCargaHoraria).toHaveBeenCalledTimes(2);
            expect(voluntariosRepository.recalcularCargaHoraria).toHaveBeenCalledWith('v1', tx);
            expect(voluntariosRepository.recalcularCargaHoraria).toHaveBeenCalledWith('v2', tx);
        });

        it('devolve 404 se a oficina não existe', async () => {
            repository.findById.mockResolvedValue(null);

            await expect(service.remove('of9')).rejects.toBeInstanceOf(NotFoundException);
        });
    });
});