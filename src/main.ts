import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { Logger } from 'nestjs-pino';

// Capturar errores no manejados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      bufferLogs: true,
    });

    // Usar el logger de Pino
    const logger = app.get(Logger);
    app.useLogger(logger);

    logger.log('🔧 Initializing NestJS application...');

    // Habilitar validación global
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    logger.debug('✅ Global pipes configured');

    // Filtro global de excepciones para personalizar respuestas de error
    app.useGlobalFilters(new HttpExceptionFilter());
    logger.debug('✅ Global filters configured');

    // Interceptor global para logging de peticiones
    app.useGlobalInterceptors(app.get(LoggingInterceptor));
    logger.debug('✅ Global interceptors configured');

    const port = process.env.PORT ?? 3001;
    logger.log(`🌐 Starting server on port ${port}...`);
    await app.listen(port);
    logger.log(`🚀 Application is running on: http://localhost:${port}`);
  } catch (error) {
    console.error('❌ Error starting the application:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}
bootstrap();
