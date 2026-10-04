import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateVoluntarioDto } from './create-voluntario.dto';

export class UpdateVoluntarioDto extends PartialType(
    OmitType(CreateVoluntarioDto, ['email', 'senha'] as const),
) { }