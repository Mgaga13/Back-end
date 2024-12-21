import {
  IsArray,
  isNotEmpty,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  amount: number;

  @IsArray()
  @IsNotEmpty()
  cartItem: any;
}
