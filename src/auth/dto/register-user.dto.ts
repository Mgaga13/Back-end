import { PartialType } from '@nestjs/swagger';
import { LoginUserDto } from './login-user.dto';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
// extends PartialType(LoginUserDto)
export class RegisterUserDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
