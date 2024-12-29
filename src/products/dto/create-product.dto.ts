import { Transform } from 'class-transformer';
import {
  IsArray,
  isArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { toNumberDto } from 'src/commom/helpers/cast.helper';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => {
    return toNumberDto(value);
  })
  price: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    return toNumberDto(value);
  })
  oldprice?: number;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  image: any;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  specification: Record<string, any>;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    return toNumberDto(value);
  })
  buyturn?: number;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => {
    return toNumberDto(value);
  })
  quantity: number;

  @IsOptional()
  @IsString()
  brand_id?: string;

  @IsOptional()
  @IsString()
  category_id?: string;
}
