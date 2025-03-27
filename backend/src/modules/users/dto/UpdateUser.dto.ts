import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @IsNotEmpty()
  isNanny?: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  address?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  profileImage?: string;
}
