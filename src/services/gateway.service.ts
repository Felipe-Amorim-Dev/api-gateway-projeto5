import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import * as jwt from 'jsonwebtoken'
import { IGatewayService } from '../interfaces/services/gateway-service.interface';
import { RouteConfigsRepository } from '../repositories/route-config.repository';
import { RequestLogsService } from './request-logs.service';
import { JwtSecretsService } from './jwt-secret.service';

@Injectable()
export class GatewayService implements IGatewayService {
  constructor(
    private readonly routeConfigsRepository: RouteConfigsRepository,
    private readonly requestLogsService: RequestLogsService,
    private readonly jwtSecretService: JwtSecretsService
  ) {}

  async processRequest(
    method: string,
    path: string,
    headers: Record<string, any>,
    body?: any,
    query?: any,
    ip?: string,
  ) {
    const startedAt = Date.now();

    const route = await this.routeConfigsRepository.findByPathAndMethod(
      path,
      method,
    );

    if (!route) {
      throw new NotFoundException('Rota não encontrada.');
    }

    if (route.requiresAuth) {
      throw this.validationExternalToken(headers.authorization);
    }

    try {
      const response = await axios({
        method,
        url: route.targetUrl,
        headers: {
          ...headers,
          host: undefined,
        },
        data: body,
        params: query,
      });

      await this.requestLogsService.create({
        method,
        originalUrl: path,
        routeType: 'PROXY',
        targetUrl: route.targetUrl,
        ip: ip ?? null,
        userAgent: headers['user-agent'] ?? null,
        statusCode: response.status,
        durationMs: Date.now() - startedAt,
        requestBody: body ? JSON.stringify(body) : null,
        responseBody: JSON.stringify(response.data),
        errorMessage: null,
      });

      return response.data;
    } catch (error: any) {
      await this.requestLogsService.create({
        method,
        originalUrl: path,
        routeType: 'PROXY',
        targetUrl: route.targetUrl,
        ip: ip ?? null,
        userAgent: headers['user-agent'] ?? null,
        statusCode: error.response?.status ?? 500,
        durationMs: Date.now() - startedAt,
        requestBody: body ? JSON.stringify(body) : null,
        responseBody: null,
        errorMessage: error.message,
      });

      throw error;
    }
  }

  private async validationExternalToken(authorization?: string){
    if(!authorization){
      throw new UnauthorizedException('Token não informado.');
    }

    const [type, token] = authorization.split(' ');

    if(type !== 'Bearer' || !token){
      throw new UnauthorizedException('Token invalido.');
    }

    const activeSecret = await this.jwtSecretService.findActive();

    try{
      jwt.verify(token, activeSecret.secret);
    }catch {
      throw new UnauthorizedException('Token externo invalido.');
    }
  }
}