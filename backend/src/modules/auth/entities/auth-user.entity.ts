import { ApiProperty } from '@nestjs/swagger';

export class AuthUserEntity {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'email' })
  email!: string;

  @ApiProperty({ nullable: true })
  displayName!: string | null;
}
