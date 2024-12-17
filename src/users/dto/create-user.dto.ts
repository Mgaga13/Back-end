import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  isString,
  IsString,
} from 'class-validator';
import { Role, UserRole } from 'src/commom/utils/constants';

export class CreateUserDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  avatar: string;
  // @IsString()
  // @IsNotEmpty()
  // confirmPassword: string;

  @IsOptional()
  @IsString()
  role: UserRole.USER;

  @IsOptional()
  @IsString()
  name: string;
}
