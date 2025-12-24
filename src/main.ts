import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

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
    console.log('🔧 Initializing NestJS application...');
    const app = await NestFactory.create(AppModule);
    console.log('✅ App module created');

    // Habilitar validación global
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    console.log('✅ Global pipes configured');

    // Filtro global de excepciones para personalizar respuestas de error
    app.useGlobalFilters(new HttpExceptionFilter());
    console.log('✅ Global filters configured');

    const port = process.env.PORT ?? 3001;
    console.log(`🌐 Starting server on port ${port}...`);
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
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
