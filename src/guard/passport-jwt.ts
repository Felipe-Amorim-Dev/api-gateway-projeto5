import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { env } from 'process';

import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class PassportJwt extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_GATEWAY,
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}