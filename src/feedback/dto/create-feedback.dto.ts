import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateFeedbackDto {
  @IsInt()
  @Min(1)
  @Max(5)
  star: number = 5; // Giá trị mặc định là 5

  @IsString()
  @IsOptional()
  content?: string = 'No feedback provided'; // Nội dung mặc định
}
