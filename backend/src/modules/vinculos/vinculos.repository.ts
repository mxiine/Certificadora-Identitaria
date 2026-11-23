import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export const voluntarioResumo = {
    select: { id: true, nome: true, curso: true, status: true },
} as const;

@Injectable()
export class VinculosRepository {
    constructor(private readonly prisma: PrismaService) { }

    findByOficina(oficinaId: string, voluntarioId?: string) {
        return this.prisma.vinculo.findMany({
            where: { oficinaId, ...(voluntarioId ? { voluntarioId } : {}) },
            include: { voluntario: voluntarioResumo },
            orderBy: { voluntario: { nome: 'asc' } },
        });
    }

    findByVoluntario(voluntarioId: string) {
        return this.prisma.vinculo.findMany({
            where: { voluntarioId },
            include: { oficina: true },
            orderBy: { oficina: { data: 'desc' } },
        });
    }

    findById(id: string) {
        return this.prisma.vinculo.findUnique({
            where: { id },
            include: { oficina: true },
        });
    }

    findByOficinaEVoluntario(oficinaId: string, voluntarioId: string) {
        return this.prisma.vinculo.findUnique({
            where: { oficinaId_voluntarioId: { oficinaId, voluntarioId } },
        });
    }
}