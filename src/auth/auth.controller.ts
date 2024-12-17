import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from 'src/auth/guards/local.guard';
import RequestWithUser from './interfaces/requestWithAccount.interface';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { JwtRefreshTokenGuard } from './guards/jwt-refresh-token.guard';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  Login(@Req() request: RequestWithUser) {
    const { user } = request;
    return this.authService.signIn(user);
  }

  @Post('sign-up')
  Register(@Body() userDto: CreateUserDto) {
    return this.authService.signUp(userDto);
  }

  @UseGuards(JwtRefreshTokenGuard)
  @Post('refresh')
  async RefreshToken(@Req() request: RequestWithUser) {
    const { user } = request;
    const { access_token } = await this.authService.signIn(user);
    return {
      access_token,
    };
  }

  // @UseGuards(LocalAuthGuard)
  // @Post('logout')
  // async logout(@Request() req) {
  //   return req.logout();
  // }
}
