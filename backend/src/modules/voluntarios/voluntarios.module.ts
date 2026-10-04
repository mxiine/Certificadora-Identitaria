import { Module } from '@nestjs/common';
import { VoluntariosController } from './voluntarios.controller';
import { VoluntariosService } from './voluntarios.service';
import { VoluntariosRepository } from './voluntarios.repository';

@Module({
    controllers: [VoluntariosController],
    providers: [VoluntariosService, VoluntariosRepository],
})
export class VoluntariosModule { }