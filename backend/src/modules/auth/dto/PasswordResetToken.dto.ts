import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetTokenDto {
  @ApiProperty({
    description: 'The token of the user requesting password reset',
    example:
      'localhost:4000/auth/reset-password?token=bfcccb3ee59be4ce98e727e08610a5361d1491eb3a343e79ec9a7f0851899187',
  })
  @IsString()
  token: string;
}
