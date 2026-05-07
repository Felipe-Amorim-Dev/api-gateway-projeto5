import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

import { UsersRepository } from './repositories/user.repository';
import { RouteConfigsRepository } from './repositories/route-config.repository';
import { RequestLogsRepository } from './repositories/request-logs.repository';
import { AccessAuditsRepository } from './repositories/access-audit.repository';
import { RefreshTokensRepository } from './repositories/refresh-token.repository';

import { UsersService } from './services/user.service';
import { RouteConfigsService } from './services/route-config.service';
import { RequestLogsService } from './services/request-logs.service';
import { AccessAuditsService } from './services/access-audit.service';
import { AuthService } from './services/auth.service';
import { GatewayService } from './services/gateway.service';

import { AuthController } from './controllers/auth.controller';
import { UsersController } from './controllers/user.controller';
import { RouteConfigsController } from './controllers/route-config.controller';
//import { JwtSecretsController } from './controllers/jwt-secret.controller';
import { RequestLogsController } from './controllers/request-log.controller';
import { AccessAuditsController } from './controllers/access-audit.controller';
import { GatewayController } from './controllers/gateway.controller';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PassportJwt } from './guard/passport-jwt';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: 'p2ReAHISLU65lsXQl+FtfA==',
      signOptions: {
        expiresIn: '1h',
      },
    }),
  ],
  controllers: [
    AppController,
    AuthController,
    UsersController,
    RouteConfigsController,
    //JwtSecretsController,
    RequestLogsController,
    AccessAuditsController,
    GatewayController,
  ],
  providers: [
    AppService,
    UsersRepository,
    RouteConfigsRepository,
    RequestLogsRepository,
    AccessAuditsRepository,
    RefreshTokensRepository,
    UsersService,
    RouteConfigsService,
    RequestLogsService,
    AccessAuditsService,
    PassportJwt,
    JwtAuthGuard,
    AuthService,
    GatewayService
  ],
})
export class AppModule { }
