import { Injectable } from '@nestjs/common';
import { IndicadoresRepository } from './indicadores.repository';
import {
    IndicadoresResponseDto,
    OficinasPorMesDto,
} from './dto/indicadores-response.dto';

const LIMITE_RANKING = 10;

@Injectable()
export class IndicadoresService {
    constructor(private readonly repository: IndicadoresRepository) { }

    async obter(agora: Date = new Date()): Promise<IndicadoresResponseDto> {
        const hoje = new Date(agora.toISOString().slice(0, 10));

        const [
            voluntariosAtivos,
            voluntariosHistorico,
            horasVoluntariado,
            criancasAtendidas,
            oficinas,
            rankingVoluntarios,
        ] = await Promise.all([
            this.repository.contarVoluntariosAtivos(),
            this.repository.contarVoluntarios(),
            this.repository.somarHoras(hoje),
            this.repository.somarCriancas(hoje),
            this.repository.datasDasOficinas(hoje),
            this.repository.rankingPorHoras(hoje, LIMITE_RANKING),
        ]);

        return {
            voluntariosAtivos,
            voluntariosHistorico,
            horasVoluntariado,
            oficinasRealizadas: oficinas.length,
            criancasAtendidas,
            oficinasPorMes: this.agruparPorMes(oficinas.map((o) => o.data)),
            rankingVoluntarios,
        };
    }

    agruparPorMes(datas: Date[]): OficinasPorMesDto[] {
        const contagem = new Map<string, number>();

        for (const data of datas) {
            const mes = data.toISOString().slice(0, 7);
            contagem.set(mes, (contagem.get(mes) ?? 0) + 1);
        }

        return [...contagem.entries()]
            .map(([mes, total]) => ({ mes, total }))
            .sort((a, b) => a.mes.localeCompare(b.mes));
    }
}