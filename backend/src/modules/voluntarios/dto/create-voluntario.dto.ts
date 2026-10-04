import { IsDateString, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateVoluntarioDto {
    @IsString()
    @MinLength(3)
    nome: string;

    @IsString()
    curso: string;

    @IsString()
    contato: string;

    @IsDateString()
    dataEntrada: string;

    // login do voluntário é opcional no cadastro — o coordenador pode criar
    // o cadastro primeiro e definir o acesso depois
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    senha?: string;
}