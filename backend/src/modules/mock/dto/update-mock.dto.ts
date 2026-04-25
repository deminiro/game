import { PartialType } from '@nestjs/swagger';
import { CreateMockDto } from '@/modules/mock/dto/create-mock.dto';

export class UpdateMockDto extends PartialType(CreateMockDto) {}
