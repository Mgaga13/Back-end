import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChangePassword {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  currentPassword: string;
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
