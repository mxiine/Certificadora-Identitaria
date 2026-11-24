import { Injectable } from '@nestjs/common';
import { StatusVoluntario } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class IndicadoresRepository {
    constructor(private readonly prisma: PrismaService) { }

    contarVoluntariosAtivos() {
        return this.prisma.voluntario.count({
            where: { status: StatusVoluntario.ATIVO },
        });
    }

    contarVoluntarios() {
        return this.prisma.voluntario.count();
    }

    async somarHoras(ate: Date) {
        const { _sum } = await this.prisma.vinculo.aggregate({
            where: { oficina: { data: { lte: ate } } },
            _sum: { horas: true },
        });
        return _sum.horas ?? 0;
    }

    async somarCriancas(ate: Date) {
        const { _sum } = await this.prisma.atendimento.aggregate({
            where: { oficina: { data: { lte: ate } } },
            _sum: { quantidade: true },
        });
        return _sum.quantidade ?? 0;
    }

    datasDasOficinas(ate: Date) {
        return this.prisma.oficina.findMany({
            where: { data: { lte: ate } },
            select: { data: true },
            orderBy: { data: 'asc' },
        });
    }

    async rankingPorHoras(ate: Date, limite: number) {
        const grupos = await this.prisma.vinculo.groupBy({
            by: ['voluntarioId'],
            where: { oficina: { data: { lte: ate } } },
            _sum: { horas: true },
            orderBy: { _sum: { horas: 'desc' } },
            take: limite,
        });

        const voluntarios = await this.prisma.voluntario.findMany({
            where: { id: { in: grupos.map((g) => g.voluntarioId) } },
            select: { id: true, nome: true },
        });
        const nomes = new Map(voluntarios.map((v) => [v.id, v.nome]));

        return grupos.map((g) => ({
            voluntarioId: g.voluntarioId,
            nome: nomes.get(g.voluntarioId) ?? '',
            horas: g._sum.horas ?? 0,
        }));
    }
}