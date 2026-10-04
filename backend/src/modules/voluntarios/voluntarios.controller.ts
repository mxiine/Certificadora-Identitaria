import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { VoluntariosService } from './voluntarios.service';
import { CreateVoluntarioDto } from './dto/create-voluntario.dto';
import { UpdateVoluntarioDto } from './dto/update-voluntario.dto';
import { FilterVoluntarioDto } from './dto/filter-voluntario.dto';

@ApiTags('Voluntários')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('voluntarios')
export class VoluntariosController {
    constructor(private readonly service: VoluntariosService) { }

    @Post()
    @Roles('COORDENADOR')
    create(@Body() dto: CreateVoluntarioDto) {
        return this.service.create(dto);
    }

    @Get()
    @Roles('COORDENADOR')
    findAll(@Query() { status }: FilterVoluntarioDto) {
        return this.service.findAll(status);
    }

    @Get(':id')
    @Roles('COORDENADOR', 'VOLUNTARIO')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Patch(':id')
    @Roles('COORDENADOR')
    update(@Param('id') id: string, @Body() dto: UpdateVoluntarioDto) {
        return this.service.update(id, dto);
    }

    @Patch(':id/desligar')
    @Roles('COORDENADOR')
    desligar(@Param('id') id: string) {
        return this.service.desligar(id);
    }
}