import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { CreateMockCommand } from '@/modules/mock/commands/create-mock.command';
import { CreateMockDto } from '@/modules/mock/dto/create-mock.dto';
import { UpdateMockDto } from '@/modules/mock/dto/update-mock.dto';
import { QueryMockDto } from '@/modules/mock/dto/query-mock.dto';
import { MockEntity } from '@/modules/mock/entities/mock.entity';

@Injectable()
export class MockService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commandBus: CommandBus,
  ) {}

  create(dto: CreateMockDto): Promise<MockEntity> {
    return this.commandBus.execute<CreateMockCommand, MockEntity>(
      new CreateMockCommand(dto),
    );
  }

  async findAll(query: QueryMockDto): Promise<{
    items: MockEntity[];
    total: number;
    take: number;
    skip: number;
  }> {
    const where: Prisma.MockWhereInput = query.search
      ? { name: { contains: query.search, mode: 'insensitive' } }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.mock.findMany({
        where,
        take: query.take,
        skip: query.skip,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.mock.count({ where }),
    ]);

    return {
      items: items.map((item) => new MockEntity(item)),
      total,
      take: query.take,
      skip: query.skip,
    };
  }

  async findOne(id: string): Promise<MockEntity> {
    const found = await this.prisma.mock.findUnique({ where: { id } });
    if (!found) {
      throw new NotFoundException(`Mock ${id} not found`);
    }
    return new MockEntity(found);
  }

  async update(id: string, dto: UpdateMockDto): Promise<MockEntity> {
    await this.ensureExists(id);
    const updated = await this.prisma.mock.update({
      where: { id },
      data: dto,
    });
    return new MockEntity(updated);
  }

  async remove(id: string): Promise<void> {
    await this.ensureExists(id);
    await this.prisma.mock.delete({ where: { id } });
  }

  private async ensureExists(id: string): Promise<void> {
    const exists = await this.prisma.mock.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Mock ${id} not found`);
    }
  }
}
