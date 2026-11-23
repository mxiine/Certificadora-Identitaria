import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PerfilUsuario } from '@prisma/client';
import { AuthUser } from '../../common/types/auth-user';
import { OficinasRepository } from '../oficinas/oficinas.repository';
import { AtendimentosRepository } from './atendimentos.repository';
import { CreateAtendimentoDto } from './dto/create-atendimento.dto';

@Injectable()
export class AtendimentosService {
    constructor(
        private readonly repository: AtendimentosRepository,
        private readonly oficinasRepository: OficinasRepository,
    ) { }

    async listar(oficinaId: string, user: AuthUser) {
        await this.garantirOficina(oficinaId);

        if (user.perfil === PerfilUsuario.VOLUNTARIO) {
            const vinculado =
                user.voluntarioId &&
                (await this.oficinasRepository.isVoluntarioVinculado(
                    oficinaId,
                    user.voluntarioId,
                ));
            if (!vinculado) {
                throw new ForbiddenException('Você não está vinculado a esta oficina');
            }
        }

        return this.repository.findByOficina(oficinaId);
    }

    async criar(oficinaId: string, dto: CreateAtendimentoDto) {
        await this.garantirOficina(oficinaId);

        return this.repository.create({
            oficina: { connect: { id: oficinaId } },
            instituicao: dto.instituicao,
            quantidade: dto.quantidade,
            observacao: dto.observacao,
        });
    }

    async remover(id: string) {
        const atendimento = await this.repository.findById(id);
        if (!atendimento) {
            throw new NotFoundException('Atendimento não encontrado');
        }
        return this.repository.delete(id);
    }

    private async garantirOficina(oficinaId: string) {
        const oficina = await this.oficinasRepository.findById(oficinaId);
        if (!oficina) {
            throw new NotFoundException('Oficina não encontrada');
        }
    }
}