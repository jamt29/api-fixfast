import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './db/database.module';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { AuthModule } from './modules/auth/auth.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { LoggerService } from './common/services/logger.service';
import { MechanicsModule } from './modules/mechanics/mechanics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isDevelopment = configService.get('NODE_ENV') !== 'production';
        const logLevel =
          configService.get('LOG_LEVEL') || (isDevelopment ? 'debug' : 'info');
        const loggingDebug = configService.get('LOGGING_DEBUG') === 'true';

        return {
          pinoHttp: {
            level: logLevel,
            transport: isDevelopment
              ? {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                    singleLine: loggingDebug,
                    messageFormat: '{msg}',
                    // Ocultar objetos JSON si LOGGING_DEBUG no está activado
                    hideObject: !loggingDebug,
                  },
                }
              : undefined,
            autoLogging: false,
            serializers: loggingDebug
              ? {
                  req: (req) => ({
                    method: req.method,
                    url: req.url,
                    query: req.query,
                    params: req.params,
                    headers: req.headers,
                    remoteAddress: req.remoteAddress,
                    remotePort: req.remotePort,
                  }),
                  res: (res) => ({
                    statusCode: res.statusCode,
                  }),
                }
              : {
                  // Desactivar serializers cuando LOGGING_DEBUG no está activado
                  // Retornar undefined para que no se agregue información
                  req: () => undefined,
                  res: () => undefined,
                },
          },
        };
      },
    }),
    DatabaseModule,
    UsersModule,
    ClientsModule,
    AuthModule,
    MechanicsModule,
  ],
  controllers: [AppController],
  providers: [AppService, LoggingInterceptor, LoggerService],
  exports: [LoggerService],
})
export class AppModule {}
