import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PerfilUsuario } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/types/auth-user';
import { dataDentroDoPeriodo } from '../../common/utils/periodo.util';
import { VoluntariosRepository } from '../voluntarios/voluntarios.repository';
import { OficinaComRelacoes, OficinasRepository } from './oficinas.repository';
import { CreateOficinaDto } from './dto/create-oficina.dto';
import { UpdateOficinaDto } from './dto/update-oficina.dto';

function toResponse({ atendimentos, _count, ...oficina }: OficinaComRelacoes) {
    return {
        ...oficina,
        totalCriancas: atendimentos.reduce((soma, a) => soma + a.quantidade, 0),
        totalVoluntarios: _count.vinculos,
    };
}

@Injectable()
export class OficinasService {
    constructor(
        private readonly repository: OficinasRepository,
        private readonly voluntariosRepository: VoluntariosRepository,
        private readonly prisma: PrismaService,
    ) { }

    async create(dto: CreateOficinaDto) {
        const oficina = await this.repository.create({
            tema: dto.tema,
            descricao: dto.descricao,
            data: new Date(dto.data),
            horaInicio: dto.horaInicio,
            horas: dto.horas,
            local: dto.local,
            professor: dto.professor,
        });
        return toResponse(oficina);
    }

    async findAll(user: AuthUser) {
        if (user.perfil === PerfilUsuario.VOLUNTARIO) {
            if (!user.voluntarioId) return [];
            const oficinas = await this.repository.findAll(user.voluntarioId);
            return oficinas.map(toResponse);
        }

        const oficinas = await this.repository.findAll();
        return oficinas.map(toResponse);
    }

    async findOne(id: string, user: AuthUser) {
        const oficina = await this.buscarOuFalhar(id);

        if (user.perfil === PerfilUsuario.VOLUNTARIO) {
            const vinculado =
                user.voluntarioId &&
                (await this.repository.isVoluntarioVinculado(id, user.voluntarioId));
            if (!vinculado) {
                throw new ForbiddenException('Você não está vinculado a esta oficina');
            }
        }

        return toResponse(oficina);
    }

    async update(id: string, dto: UpdateOficinaDto) {
        await this.buscarOuFalhar(id);

        if (dto.data) {
            await this.validarNovaData(id, new Date(dto.data));
        }

        await this.prisma.$transaction(async (tx) => {
            await tx.oficina.update({
                where: { id },
                data: {
                    tema: dto.tema,
                    descricao: dto.descricao,
                    data: dto.data ? new Date(dto.data) : undefined,
                    horaInicio: dto.horaInicio,
                    horas: dto.horas,
                    local: dto.local,
                    professor: dto.professor,
                },
            });

            if (dto.horas !== undefined) {
                const acimaDoLimite = { oficinaId: id, horas: { gt: dto.horas } };
                const afetados = await tx.vinculo.findMany({
                    where: acimaDoLimite,
                    select: { voluntarioId: true },
                });

                if (afetados.length > 0) {
                    await tx.vinculo.updateMany({
                        where: acimaDoLimite,
                        data: { horas: dto.horas },
                    });
                    for (const { voluntarioId } of afetados) {
                        await this.voluntariosRepository.recalcularCargaHoraria(voluntarioId, tx);
                    }
                }
            }
        });

        return toResponse(await this.buscarOuFalhar(id));
    }

    async remove(id: string) {
        await this.buscarOuFalhar(id);

        return this.prisma.$transaction(async (tx) => {
            const vinculos = await tx.vinculo.findMany({
                where: { oficinaId: id },
                select: { voluntarioId: true },
            });

            const removida = await tx.oficina.delete({ where: { id } });

            for (const { voluntarioId } of vinculos) {
                await this.voluntariosRepository.recalcularCargaHoraria(voluntarioId, tx);
            }

            return removida;
        });
    }

    private async buscarOuFalhar(id: string) {
        const oficina = await this.repository.findById(id);
        if (!oficina) {
            throw new NotFoundException('Oficina não encontrada');
        }
        return oficina;
    }

    private async validarNovaData(oficinaId: string, data: Date) {
        const vinculos = await this.prisma.vinculo.findMany({
            where: { oficinaId },
            include: {
                voluntario: { select: { nome: true, dataEntrada: true, dataSaida: true } },
            },
        });

        const fora = vinculos.filter(
            (v) =>
                !dataDentroDoPeriodo(data, v.voluntario.dataEntrada, v.voluntario.dataSaida),
        );

        if (fora.length > 0) {
            const nomes = fora.map((v) => v.voluntario.nome).join(', ');
            throw new BadRequestException(
                `A nova data fica fora do período de atuação de: ${nomes}`,
            );
        }
    }
}