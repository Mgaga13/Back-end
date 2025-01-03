import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min, IsString } from 'class-validator';
import { Order } from '../utils/constants';

export class PageOptionsDto {
  @IsOptional()
  @IsEnum(Order)
  readonly order?: Order = Order.DESC;

  @IsOptional()
  @IsString()
  @Type(() => String)
  readonly sort?: string = 'createdAt';

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  readonly page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  readonly limit?: number = 10;

  @IsOptional()
  status?: any;
}
