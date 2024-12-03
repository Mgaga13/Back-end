import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  session_id?: string;

  @IsNotEmpty()
  @IsNumber()
  status: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsNotEmpty()
  @IsNumber()
  total: number;

  @IsOptional()
  @IsNumber()
  user_id?: number;
}
