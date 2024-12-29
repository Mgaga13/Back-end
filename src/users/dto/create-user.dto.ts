import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  isString,
  IsString,
  Matches,
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

  @IsOptional()
  @IsString()
  @Matches(/^(Male|Female|Other)$/, {
    message: 'Gender must be Male, Female, or Other',
  })
  gender: string;

  @IsOptional()
  dob: any;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @IsOptional()
  @IsString()
  role: UserRole.USER;

  @IsOptional()
  @IsString()
  name: string;
}
