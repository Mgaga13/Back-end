import { IsOptional, IsString } from 'class-validator';

export class StatisticsDto {
  @IsOptional()
  @IsString()
  startDate?: string; // Định dạng: 'YYYY-MM-DD'

  @IsOptional()
  @IsString()
  endDate?: string; // Định dạng: 'YYYY-MM-DD'
}
