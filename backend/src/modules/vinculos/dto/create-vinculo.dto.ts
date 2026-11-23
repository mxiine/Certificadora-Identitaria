import { IsEnum, IsNumber, IsPositive, IsUUID } from 'class-validator';
import { PapelVinculo } from '@prisma/client';

export class CreateVinculoDto {
    @IsUUID()
    voluntarioId: string;

    @IsEnum(PapelVinculo)
    papel: PapelVinculo;

    @IsNumber()
    @IsPositive()
    horas: number;
}