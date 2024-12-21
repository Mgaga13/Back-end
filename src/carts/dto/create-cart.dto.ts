import {
  IsNotEmpty,
  IsNumber,
  isNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCartDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  // @IsNumber()
  // @IsNotEmpty()
  // quantity: number;

  // @IsString()
  // @IsOptional()
  // userId?: string;
}
