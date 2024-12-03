import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateOrderDetailDto {
  @IsNotEmpty()
  @IsNumber()
  order_id: number;

  @IsOptional()
  @IsNumber()
  product_id?: number;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
