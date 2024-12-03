import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateFeedbackDto {
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  star?: number;

  @IsString()
  @IsOptional()
  content?: string;
}
