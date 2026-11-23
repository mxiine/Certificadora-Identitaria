import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AtendimentosRepository {
    constructor(private readonly prisma: PrismaService) { }

    findByOficina(oficinaId: string) {
        return this.prisma.atendimento.findMany({
            where: { oficinaId },
            orderBy: { criadoEm: 'asc' },
        });
    }

    findById(id: string) {
        return this.prisma.atendimento.findUnique({ where: { id } });
    }

    create(data: Prisma.AtendimentoCreateInput) {
        return this.prisma.atendimento.create({ data });
    }

    delete(id: string) {
        return this.prisma.atendimento.delete({ where: { id } });
    }
}