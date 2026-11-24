import { Module } from '@nestjs/common';
import { IndicadoresController } from './indicadores.controller';
import { IndicadoresService } from './indicadores.service';
import { IndicadoresRepository } from './indicadores.repository';

@Module({
    controllers: [IndicadoresController],
    providers: [IndicadoresService, IndicadoresRepository],
})
export class IndicadoresModule { }