import { IsOptional, IsString } from 'class-validator';

export class StatisticsDtoMoth {
  @IsOptional()
  @IsString()
  startYear?: string; // Định dạng: 'YYYY-MM-DD'

  @IsOptional()
  @IsString()
  endYear?: string; // Định dạng: 'YYYY-MM-DD'
}
