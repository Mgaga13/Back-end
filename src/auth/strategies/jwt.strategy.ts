import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { AccessTokenPayload } from 'src/commom/type/AccesTokenPayload';
import { TokenPayload } from '../interfaces/tokenPayload.interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly users_service: UsersService,
    private readonly configService: ConfigService,
  ) {
    const jwtSecret = configService.get('JWT_SECRET');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: TokenPayload) {
    return await this.users_service.findOneById(payload.id);
  }
}
