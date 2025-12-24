import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const duration = Date.now() - startTime;

          this.logger.info(`✓ ${method} ${url} ${statusCode} (${duration}ms)`);
        },
        error: (error) => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode || 500;
          const duration = Date.now() - startTime;

          this.logger.error(
            `✗ ${method} ${url} ${statusCode} (${duration}ms) - ${error.message}`,
          );
        },
      }),
    );
  }
}
