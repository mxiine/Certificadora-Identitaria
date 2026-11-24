export class OficinasPorMesDto {
    mes: string;
    total: number;
}

export class RankingVoluntarioDto {
    voluntarioId: string;
    nome: string;
    horas: number;
}

export class IndicadoresResponseDto {
    voluntariosAtivos: number;
    voluntariosHistorico: number;
    horasVoluntariado: number;
    oficinasRealizadas: number;
    criancasAtendidas: number;
    oficinasPorMes: OficinasPorMesDto[];
    rankingVoluntarios: RankingVoluntarioDto[];
}