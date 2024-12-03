import { IsInt, IsPositive, IsUUID } from 'class-validator';
export class CreateCartItemDto {
  @IsUUID()
  cartId: string;

  @IsUUID()
  productId: string;

  @IsInt()
  @IsPositive()
  quantity: number;
}
