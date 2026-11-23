import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateAtendimentoDto {
    @IsString()
    @IsNotEmpty()
    instituicao: string;

    @IsInt()
    @Min(1)
    quantidade: number;

    @IsOptional()
    @IsString()
    observacao?: string;
}