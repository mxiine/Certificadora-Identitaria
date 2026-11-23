import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export const oficinaInclude = {
    atendimentos: { select: { quantidade: true } },
    _count: { select: { vinculos: true } },
} satisfies Prisma.OficinaInclude;

export type OficinaComRelacoes = Prisma.OficinaGetPayload<{
    include: typeof oficinaInclude;
}>;

@Injectable()
export class OficinasRepository {
    constructor(private readonly prisma: PrismaService) { }

    create(data: Prisma.OficinaCreateInput) {
        return this.prisma.oficina.create({ data, include: oficinaInclude });
    }

    findAll(voluntarioId?: string) {
        return this.prisma.oficina.findMany({
            where: voluntarioId ? { vinculos: { some: { voluntarioId } } } : undefined,
            include: oficinaInclude,
            orderBy: { data: 'desc' },
        });
    }

    findById(id: string) {
        return this.prisma.oficina.findUnique({
            where: { id },
            include: oficinaInclude,
        });
    }

    async isVoluntarioVinculado(oficinaId: string, voluntarioId: string) {
        const total = await this.prisma.vinculo.count({
            where: { oficinaId, voluntarioId },
        });
        return total > 0;
    }
}