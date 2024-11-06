import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RefreshUserDto {
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}
