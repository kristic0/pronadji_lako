import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchParamDto {
  @ApiProperty()
  @IsOptional() // Makes this query parameter optional
  @IsString() // Validates that the query parameter is a string
  q?: string;
}
