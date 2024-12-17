import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Order } from 'src/commom/utils/constants';

export class PageProductDto {
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
  @IsString()
  @Type(() => String)
  readonly searchText: string;
}
