import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
const bcrypt = require('bcryptjs');
import { AccessToken } from 'src/commom/type/AccessToken';
import { MailService } from 'src/commom/services/mail.service';
import { nanoid } from 'nanoid';
import { ChangePassword } from './dto/change-pass.dto';
@Injectable()
export class AuthService {
  private SALT_ROUND = 11;
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, password: string) {
    try {
      const user = await this.userService.findOneByEmail(email);
      await this.verifyPlainContentWithHashedContent(password, user.password);
      return user;
    } catch (error) {
      throw new BadRequestException('Wrong credentials!!');
    }
  }
  async signIn({ id, email, role }): Promise<AccessToken | any> {
    const payload = { id: id, email: email, role: role };
    return await this.generateToken(payload);
  }

  async signUp(userDto: CreateUserDto) {
    const hashed_password = await this.hashPasswordUser(userDto.password);
    return await this.userService.create({
      ...userDto,
      password: hashed_password,
    });
  }

  private async generateToken(payload: { id: string; email: string }) {
    const access_token = await this.jwtService.signAsync(payload);
    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME'),
    });
    await this.userService.updateRefreshToken(payload.email, refresh_token);

    return {
      data: {
        access_token,
        refresh_token,
      },
      success: true,
    };
  }

  async getUserIfRefreshTokenMatched(
    id: string,
    refresh_token: string,
  ): Promise<any> {
    try {
      const user = await this.userService.findOneById(id);
      if (!user) {
        throw new UnauthorizedException();
      }
      await this.jwtService.verifyAsync(refresh_token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  private async hashPasswordUser(password: string) {
    const salt = bcrypt.genSaltSync(this.SALT_ROUND);
    return await bcrypt.hash(password, salt);
  }
  private async verifyPlainContentWithHashedContent(
    plain_text: string,
    hashed_text: string,
  ) {
    const is_matching = await bcrypt.compare(plain_text, hashed_text);
    if (!is_matching) {
      throw new BadRequestException();
    }
  }

  public async forgotPassword(email: string) {
    const user = await this.userService.findOneByEmail(email);
    if (user) {
      //If user exists, generate password reset link
      const tokenCreatedAt = new Date();
      tokenCreatedAt.setHours(tokenCreatedAt.getHours() + 1);

      const resetToken = nanoid(64);
      await this.userService.resetTokenSendEmail({
        user: user,
        resetPasswordToken: resetToken,
        tokenCreatedAt,
      });
      //Send the link to the user by email
      this.mailService.sendPasswordResetEmail(email, resetToken, user.id);
      return {
        success: true,
        message: 'Email sent',
      };
    } else {
      throw new BadRequestException('Email is not exits');
    }
  }

  async resetPassword(newPassword: string, token: string) {
    const user = await this.userService.findOneByToken(token, newPassword);
    delete user.password;
    delete user.balance;
    return user;
  }
  async changePassword(dtoChange: ChangePassword) {
    const user = await this.userService.findUserById(dtoChange.id);
    await this.verifyPlainContentWithHashedContent(
      dtoChange.currentPassword,
      user.password,
    );
    const hashed_password = await this.hashPasswordUser(dtoChange.newPassword);
    return this.userService.updatePassword(dtoChange.id, hashed_password);
  }
}
