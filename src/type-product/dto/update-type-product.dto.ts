import { PartialType } from '@nestjs/swagger';
import { CreateTypeProductDto } from './create-type-product.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTypeProductDto extends PartialType(CreateTypeProductDto) {
  @IsString()
  @IsNotEmpty()
  id: string;
}
