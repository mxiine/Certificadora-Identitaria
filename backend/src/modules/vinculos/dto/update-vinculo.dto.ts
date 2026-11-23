import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateVinculoDto } from './create-vinculo.dto';

export class UpdateVinculoDto extends PartialType(
    OmitType(CreateVinculoDto, ['voluntarioId'] as const),
) { }