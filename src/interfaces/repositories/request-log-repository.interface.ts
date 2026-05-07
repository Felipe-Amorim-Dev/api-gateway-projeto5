import { RequestLog } from 'src/models/request-log.model';
import { CreateRequestLogDto } from 'src/dtos/logs/create-log.dto';

export interface IRequestLogRepository {
  create(data: CreateRequestLogDto): Promise<RequestLog>;
  findAll(): Promise<RequestLog[]>;
  findById(id: string): Promise<RequestLog | null>;
}