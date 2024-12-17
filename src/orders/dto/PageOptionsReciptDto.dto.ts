import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min, IsString } from 'class-validator';

export class PageOptionsReciptDto {
  @IsOptional()
  @IsString()
  readonly startDate: string;

  @IsOptional()
  @IsString()
  readonly endDate: string;
}
