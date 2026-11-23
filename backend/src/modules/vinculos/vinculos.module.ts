import { Module } from '@nestjs/common';
import { OficinasModule } from '../oficinas/oficinas.module';
import { VoluntariosModule } from '../voluntarios/voluntarios.module';
import { VinculosController } from './vinculos.controller';
import { VinculosService } from './vinculos.service';
import { VinculosRepository } from './vinculos.repository';

@Module({
    imports: [OficinasModule, VoluntariosModule],
    controllers: [VinculosController],
    providers: [VinculosService, VinculosRepository],
})
export class VinculosModule { }