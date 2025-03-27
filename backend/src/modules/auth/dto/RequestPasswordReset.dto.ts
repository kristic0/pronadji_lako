import { IsBoolean, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestPasswordResetDto {
  @ApiProperty({
    description: 'The email of the user requesting password reset',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;
}
