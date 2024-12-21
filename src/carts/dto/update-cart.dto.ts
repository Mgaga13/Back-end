import { PartialType } from '@nestjs/swagger';
import { CreateCartDto } from './create-cart.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCartDto extends PartialType(CreateCartDto) {
  @IsString()
  @IsNotEmpty()
  cartId: string;

  @IsOptional()
  @IsString()
  quantity?: string;
}
