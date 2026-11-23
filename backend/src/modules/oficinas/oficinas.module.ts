import { Module } from '@nestjs/common';
import { VoluntariosModule } from '../voluntarios/voluntarios.module';
import { OficinasController } from './oficinas.controller';
import { OficinasService } from './oficinas.service';
import { OficinasRepository } from './oficinas.repository';

@Module({
    imports: [VoluntariosModule],
    controllers: [OficinasController],
    providers: [OficinasService, OficinasRepository],
    exports: [OficinasRepository],
})
export class OficinasModule { }