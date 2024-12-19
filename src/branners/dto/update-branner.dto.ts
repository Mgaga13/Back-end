import { PartialType } from '@nestjs/swagger';
import { CreateBrannerDto } from './create-branner.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateBrannerDto extends PartialType(CreateBrannerDto) {
  @IsNotEmpty()
  @IsString()
  id: string;
}
