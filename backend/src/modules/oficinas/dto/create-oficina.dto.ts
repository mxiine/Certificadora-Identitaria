import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    Matches,
} from 'class-validator';

export class CreateOficinaDto {
    @IsString()
    @IsNotEmpty()
    tema: string;

    @IsOptional()
    @IsString()
    descricao?: string;

    @IsDateString()
    data: string;

    @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
        message: 'horaInicio deve estar no formato HH:mm',
    })
    horaInicio: string;

    @IsNumber()
    @IsPositive()
    horas: number;

    @IsString()
    local: string;

    @IsString()
    @IsNotEmpty()
    professor: string;
}