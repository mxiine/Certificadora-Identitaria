import { Injectable } from '@nestjs/common';
import { Prisma, StatusVoluntario } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VoluntariosRepository {
    constructor(private readonly prisma: PrismaService) { }

    create(data: Prisma.VoluntarioCreateInput) {
        return this.prisma.voluntario.create({ data });
    }

    findAll(status?: StatusVoluntario) {
        return this.prisma.voluntario.findMany({
            where: status ? { status } : undefined,
            orderBy: { nome: 'asc' },
        });
    }

    findById(id: string) {
        return this.prisma.voluntario.findUnique({ where: { id } });
    }

    update(id: string, data: Prisma.VoluntarioUpdateInput) {
        return this.prisma.voluntario.update({ where: { id }, data });
    }
}