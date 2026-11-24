import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { IndicadoresService } from './indicadores.service';
import { IndicadoresResponseDto } from './dto/indicadores-response.dto';

@ApiTags('Indicadores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('indicadores')
export class IndicadoresController {
    constructor(private readonly service: IndicadoresService) { }

    @Get()
    @Roles('COORDENADOR')
    @ApiOkResponse({ type: IndicadoresResponseDto })
    obter() {
        return this.service.obter();
    }
}