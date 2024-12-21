import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Request,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from 'src/auth/guards/local.guard';
import RequestWithUser from './interfaces/requestWithAccount.interface';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { JwtRefreshTokenGuard } from './guards/jwt-refresh-token.guard';
import { ForgotPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/forgot-password.dto';
import { ChangePassword } from './dto/change-pass.dto';
import { Roles } from './decorators/roler.decorator';
import { RolesGuard } from './guards/roles.guard';
import { UserRole } from 'src/commom/utils/constants';
import { Public } from './decorators/auth.decorator';

@UseGuards(JwtAuthGuard)
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  Login(@Req() request: RequestWithUser) {
    const { user } = request;
    return this.authService.signIn(user);
  }
  @Public()
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
  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Roles(UserRole.USER)
  @UseGuards(RolesGuard)
  @Post('change-password')
  async changePassword(@Req() req, @Body() updateUserDto: ChangePassword) {
    const user = req['user'];
    updateUserDto.id = user.id;
    return this.authService.changePassword(updateUserDto);
  }

  @Public()
  @Put('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.newPassword,
      resetPasswordDto.resetToken,
    );
  }
  // @UseGuards(LocalAuthGuard)
  // @Post('logout')
  // async logout(@Request() req) {
  //   return req.logout();
  // }
}
