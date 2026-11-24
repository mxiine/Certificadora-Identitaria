import { IndicadoresService } from './indicadores.service';

describe('IndicadoresService', () => {
    let repository: {
        contarVoluntariosAtivos: jest.Mock;
        contarVoluntarios: jest.Mock;
        somarHoras: jest.Mock;
        somarCriancas: jest.Mock;
        datasDasOficinas: jest.Mock;
        rankingPorHoras: jest.Mock;
    };
    let service: IndicadoresService;

    beforeEach(() => {
        repository = {
            contarVoluntariosAtivos: jest.fn().mockResolvedValue(2),
            contarVoluntarios: jest.fn().mockResolvedValue(5),
            somarHoras: jest.fn().mockResolvedValue(12),
            somarCriancas: jest.fn().mockResolvedValue(30),
            datasDasOficinas: jest.fn().mockResolvedValue([
                { data: new Date('2026-10-14') },
                { data: new Date('2026-10-21') },
                { data: new Date('2026-11-04') },
            ]),
            rankingPorHoras: jest
                .fn()
                .mockResolvedValue([{ voluntarioId: 'v1', nome: 'Ana Lima', horas: 8 }]),
        };
        service = new IndicadoresService(repository as never);
    });

    it('monta o painel com os números do repository', async () => {
        const resultado = await service.obter(new Date('2026-11-23T15:00:00Z'));

        expect(resultado).toEqual({
            voluntariosAtivos: 2,
            voluntariosHistorico: 5,
            horasVoluntariado: 12,
            oficinasRealizadas: 3,
            criancasAtendidas: 30,
            oficinasPorMes: [
                { mes: '2026-10', total: 2 },
                { mes: '2026-11', total: 1 },
            ],
            rankingVoluntarios: [{ voluntarioId: 'v1', nome: 'Ana Lima', horas: 8 }],
        });
    });

    it('só conta como realizadas as oficinas até a meia-noite (UTC) de hoje', async () => {
        await service.obter(new Date('2026-11-23T15:00:00Z'));

        const hoje = new Date('2026-11-23');
        expect(repository.somarHoras).toHaveBeenCalledWith(hoje);
        expect(repository.somarCriancas).toHaveBeenCalledWith(hoje);
        expect(repository.datasDasOficinas).toHaveBeenCalledWith(hoje);
        expect(repository.rankingPorHoras).toHaveBeenCalledWith(hoje, 10);
    });

    it('com o banco vazio devolve tudo zerado', async () => {
        repository.contarVoluntariosAtivos.mockResolvedValue(0);
        repository.contarVoluntarios.mockResolvedValue(0);
        repository.somarHoras.mockResolvedValue(0);
        repository.somarCriancas.mockResolvedValue(0);
        repository.datasDasOficinas.mockResolvedValue([]);
        repository.rankingPorHoras.mockResolvedValue([]);

        const resultado = await service.obter();

        expect(resultado.oficinasRealizadas).toBe(0);
        expect(resultado.oficinasPorMes).toEqual([]);
        expect(resultado.rankingVoluntarios).toEqual([]);
    });

    describe('agruparPorMes', () => {
        it('agrupa por AAAA-MM e ordena do mais antigo pro mais novo', () => {
            const resultado = service.agruparPorMes([
                new Date('2026-11-04'),
                new Date('2026-10-14'),
                new Date('2026-11-18'),
            ]);

            expect(resultado).toEqual([
                { mes: '2026-10', total: 1 },
                { mes: '2026-11', total: 2 },
            ]);
        });
    });
});