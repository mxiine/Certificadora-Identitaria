import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user';
import { VinculosService } from './vinculos.service';
import { CreateVinculoDto } from './dto/create-vinculo.dto';
import { UpdateVinculoDto } from './dto/update-vinculo.dto';

@ApiTags('Vínculos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class VinculosController {
    constructor(private readonly service: VinculosService) { }

    @Get('oficinas/:oficinaId/vinculos')
    @Roles('COORDENADOR', 'VOLUNTARIO')
    listarPorOficina(
        @Param('oficinaId') oficinaId: string,
        @CurrentUser() user: AuthUser,
    ) {
        return this.service.listarPorOficina(oficinaId, user);
    }

    @Post('oficinas/:oficinaId/vinculos')
    @Roles('COORDENADOR')
    criar(@Param('oficinaId') oficinaId: string, @Body() dto: CreateVinculoDto) {
        return this.service.criar(oficinaId, dto);
    }

    @Patch('vinculos/:id')
    @Roles('COORDENADOR')
    atualizar(@Param('id') id: string, @Body() dto: UpdateVinculoDto) {
        return this.service.atualizar(id, dto);
    }

    @Delete('vinculos/:id')
    @Roles('COORDENADOR')
    remover(@Param('id') id: string) {
        return this.service.remover(id);
    }

    @Get('voluntarios/:voluntarioId/vinculos')
    @Roles('COORDENADOR', 'VOLUNTARIO')
    listarPorVoluntario(
        @Param('voluntarioId') voluntarioId: string,
        @CurrentUser() user: AuthUser,
    ) {
        return this.service.listarPorVoluntario(voluntarioId, user);
    }
}