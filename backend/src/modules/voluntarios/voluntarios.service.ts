import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { StatusVoluntario } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { VoluntariosRepository } from './voluntarios.repository';
import { CreateVoluntarioDto } from './dto/create-voluntario.dto';
import { UpdateVoluntarioDto } from './dto/update-voluntario.dto';

@Injectable()
export class VoluntariosService {
    constructor(
        private readonly repository: VoluntariosRepository,
        private readonly prisma: PrismaService,
    ) { }

    async create(dto: CreateVoluntarioDto) {
        if (dto.email) {
            const emailExistente = await this.prisma.usuario.findUnique({
                where: { email: dto.email },
            });
            if (emailExistente) {
                throw new ConflictException('Já existe um usuário com esse e-mail');
            }
        }

        return this.prisma.$transaction(async (tx) => {
            const voluntario = await tx.voluntario.create({
                data: {
                    nome: dto.nome,
                    curso: dto.curso,
                    contato: dto.contato,
                    dataEntrada: new Date(dto.dataEntrada),
                },
            });

            if (dto.email && dto.senha) {
                const senhaHash = await bcrypt.hash(dto.senha, 10);
                await tx.usuario.create({
                    data: {
                        email: dto.email,
                        senhaHash,
                        perfil: 'VOLUNTARIO',
                        voluntarioId: voluntario.id,
                    },
                });
            }

            return voluntario;
        });
    }

    findAll(status?: StatusVoluntario) {
        return this.repository.findAll(status);
    }

    async findOne(id: string) {
        const voluntario = await this.repository.findById(id);
        if (!voluntario) {
            throw new NotFoundException('Voluntário não encontrado');
        }
        return voluntario;
    }

    async update(id: string, dto: UpdateVoluntarioDto) {
        await this.findOne(id);
        return this.repository.update(id, dto);
    }

    async desligar(id: string) {
        await this.findOne(id);
        return this.repository.update(id, {
            status: 'INATIVO',
            dataSaida: new Date(),
        });
    }
}