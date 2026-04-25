import { ICommand } from '@nestjs/cqrs';
import { CreateMockDto } from '@/modules/mock/dto/create-mock.dto';

export class CreateMockCommand implements ICommand {
  constructor(public readonly dto: CreateMockDto) {}
}
