import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTypeProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
