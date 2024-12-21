import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateFeedbackDto {
  @IsInt()
  @Min(1)
  @Max(5)
  star: number;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  productId: string;

  @IsInt()
  @IsOptional()
  userId?: string;
}
