import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBrannerDto {
  @IsOptional()
  @IsString()
  image: string;
}
