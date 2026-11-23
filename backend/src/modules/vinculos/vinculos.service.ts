import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PerfilUsuario, StatusVoluntario } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/types/auth-user';
import { dataDentroDoPeriodo } from '../../common/utils/periodo.util';
import { OficinasRepository } from '../oficinas/oficinas.repository';
import { VoluntariosRepository } from '../voluntarios/voluntarios.repository';
import { VinculosRepository, voluntarioResumo } from './vinculos.repository';
import { CreateVinculoDto } from './dto/create-vinculo.dto';
import { UpdateVinculoDto } from './dto/update-vinculo.dto';

@Injectable()
export class VinculosService {
    constructor(
        private readonly repository: VinculosRepository,
        private readonly oficinasRepository: OficinasRepository,
        private readonly voluntariosRepository: VoluntariosRepository,
        private readonly prisma: PrismaService,
    ) { }

    async listarPorOficina(oficinaId: string, user: AuthUser) {
        await this.buscarOficina(oficinaId);

        if (user.perfil === PerfilUsuario.VOLUNTARIO) {
            if (!user.voluntarioId) return [];
            return this.repository.findByOficina(oficinaId, user.voluntarioId);
        }

        return this.repository.findByOficina(oficinaId);
    }

    async listarPorVoluntario(voluntarioId: string, user: AuthUser) {
        if (user.perfil === PerfilUsuario.VOLUNTARIO && user.voluntarioId !== voluntarioId) {
            throw new ForbiddenException('Você só pode ver o seu próprio histórico');
        }

        const voluntario = await this.voluntariosRepository.findById(voluntarioId);
        if (!voluntario) {
            throw new NotFoundException('Voluntário não encontrado');
        }

        return this.repository.findByVoluntario(voluntarioId);
    }

    async criar(oficinaId: string, dto: CreateVinculoDto) {
        const oficina = await this.buscarOficina(oficinaId);

        const voluntario = await this.voluntariosRepository.findById(dto.voluntarioId);
        if (!voluntario) {
            throw new NotFoundException('Voluntário não encontrado');
        }

        if (voluntario.status !== StatusVoluntario.ATIVO) {
            throw new BadRequestException(
                'Apenas voluntários ativos podem ser vinculados a novas oficinas',
            );
        }

        if (
            !dataDentroDoPeriodo(oficina.data, voluntario.dataEntrada, voluntario.dataSaida)
        ) {
            throw new BadRequestException(
                'A data da oficina está fora do período de atuação do voluntário',
            );
        }

        this.validarHoras(dto.horas, oficina.horas);

        const existente = await this.repository.findByOficinaEVoluntario(
            oficinaId,
            dto.voluntarioId,
        );
        if (existente) {
            throw new ConflictException('Este voluntário já está vinculado a esta oficina');
        }

        return this.prisma.$transaction(async (tx) => {
            const vinculo = await tx.vinculo.create({
                data: {
                    oficinaId,
                    voluntarioId: dto.voluntarioId,
                    papel: dto.papel,
                    horas: dto.horas,
                },
                include: { voluntario: voluntarioResumo },
            });

            await this.voluntariosRepository.recalcularCargaHoraria(dto.voluntarioId, tx);
            return vinculo;
        });
    }

    async atualizar(id: string, dto: UpdateVinculoDto) {
        const vinculo = await this.buscarVinculo(id);

        if (dto.horas !== undefined) {
            this.validarHoras(dto.horas, vinculo.oficina.horas);
        }

        return this.prisma.$transaction(async (tx) => {
            const atualizado = await tx.vinculo.update({
                where: { id },
                data: { papel: dto.papel, horas: dto.horas },
                include: { voluntario: voluntarioResumo },
            });

            await this.voluntariosRepository.recalcularCargaHoraria(vinculo.voluntarioId, tx);
            return atualizado;
        });
    }

    async remover(id: string) {
        const vinculo = await this.buscarVinculo(id);

        return this.prisma.$transaction(async (tx) => {
            const removido = await tx.vinculo.delete({ where: { id } });
            await this.voluntariosRepository.recalcularCargaHoraria(vinculo.voluntarioId, tx);
            return removido;
        });
    }

    private validarHoras(horas: number, limite: number) {
        if (horas <= 0 || horas > limite) {
            throw new BadRequestException(
                `As horas do vínculo devem ser maiores que 0 e no máximo ${limite}h (duração da oficina)`,
            );
        }
    }

    private async buscarOficina(id: string) {
        const oficina = await this.oficinasRepository.findById(id);
        if (!oficina) {
            throw new NotFoundException('Oficina não encontrada');
        }
        return oficina;
    }

    private async buscarVinculo(id: string) {
        const vinculo = await this.repository.findById(id);
        if (!vinculo) {
            throw new NotFoundException('Vínculo não encontrado');
        }
        return vinculo;
    }
}