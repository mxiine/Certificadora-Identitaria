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
import { OficinasService } from './oficinas.service';
import { CreateOficinaDto } from './dto/create-oficina.dto';
import { UpdateOficinaDto } from './dto/update-oficina.dto';

@ApiTags('Oficinas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('oficinas')
export class OficinasController {
    constructor(private readonly service: OficinasService) { }

    @Post()
    @Roles('COORDENADOR')
    create(@Body() dto: CreateOficinaDto) {
        return this.service.create(dto);
    }

    @Get()
    @Roles('COORDENADOR', 'VOLUNTARIO')
    findAll(@CurrentUser() user: AuthUser) {
        return this.service.findAll(user);
    }

    @Get(':id')
    @Roles('COORDENADOR', 'VOLUNTARIO')
    findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
        return this.service.findOne(id, user);
    }

    @Patch(':id')
    @Roles('COORDENADOR')
    update(@Param('id') id: string, @Body() dto: UpdateOficinaDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @Roles('COORDENADOR')
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}