import { ApiProperty } from '@nestjs/swagger';
import { Mock as PrismaMock } from '@prisma/client';

export class MockEntity implements PrismaMock {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true, type: String })
  description!: string | null;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;

  constructor(partial: Partial<MockEntity>) {
    Object.assign(this, partial);
  }
}
