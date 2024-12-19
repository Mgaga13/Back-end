import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBrannerDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  image: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
