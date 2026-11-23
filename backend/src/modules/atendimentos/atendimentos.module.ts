import { Module } from '@nestjs/common';
import { OficinasModule } from '../oficinas/oficinas.module';
import { AtendimentosController } from './atendimentos.controller';
import { AtendimentosService } from './atendimentos.service';
import { AtendimentosRepository } from './atendimentos.repository';

@Module({
    imports: [OficinasModule],
    controllers: [AtendimentosController],
    providers: [AtendimentosService, AtendimentosRepository],
})
export class AtendimentosModule { }