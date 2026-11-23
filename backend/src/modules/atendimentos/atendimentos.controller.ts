import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user';
import { AtendimentosService } from './atendimentos.service';
import { CreateAtendimentoDto } from './dto/create-atendimento.dto';

@ApiTags('Atendimentos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class AtendimentosController {
    constructor(private readonly service: AtendimentosService) { }

    @Get('oficinas/:oficinaId/atendimentos')
    @Roles('COORDENADOR', 'VOLUNTARIO')
    listar(@Param('oficinaId') oficinaId: string, @CurrentUser() user: AuthUser) {
        return this.service.listar(oficinaId, user);
    }

    @Post('oficinas/:oficinaId/atendimentos')
    @Roles('COORDENADOR')
    criar(@Param('oficinaId') oficinaId: string, @Body() dto: CreateAtendimentoDto) {
        return this.service.criar(oficinaId, dto);
    }

    @Delete('atendimentos/:id')
    @Roles('COORDENADOR')
    remover(@Param('id') id: string) {
        return this.service.remover(id);
    }
}