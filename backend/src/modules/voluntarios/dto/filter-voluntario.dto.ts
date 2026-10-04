import { IsEnum, IsOptional } from 'class-validator';
import { StatusVoluntario } from '@prisma/client';

export class FilterVoluntarioDto {
    @IsOptional()
    @IsEnum(StatusVoluntario)
    status?: StatusVoluntario;
}