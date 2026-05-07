import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { IGatewayService } from '../interfaces/services/gateway-service.interface';
import { RouteConfigsRepository } from '../repositories/route-config.repository';
import { RequestLogsService } from './request-logs.service';

@Injectable()
export class GatewayService implements IGatewayService {
  constructor(
    private readonly routeConfigsRepository: RouteConfigsRepository,
    private readonly requestLogsService: RequestLogsService,
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

    if (route.requiresAuth && !headers.authorization) {
      throw new UnauthorizedException('Token não informado.');
    }

    try {
      const response = await axios({
        method,
        url: route.targetUrl,
        headers,
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
}