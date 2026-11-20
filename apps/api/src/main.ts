import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('DevSutraBootstrap');
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3001;
  const apiPrefix = process.env.API_PREFIX || 'api/v1';

  // Security & Middleware
  app.use(cookieParser());
  app.enableCors({
    origin: (origin, callback) => {
      // Allow mobile apps, local web, and tools without origin or with any local/dev origin
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global Prefix & Pipeline
  app.setGlobalPrefix(apiPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('DevSutra API')
    .setDescription('DevSutra – Online Puja Booking, Vedic Pandit Marketplace & Samagri Platform API')
    .setVersion('2.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 DevSutra API running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📚 Swagger Docs available at: http://localhost:${port}/${apiPrefix}/docs`);
  logger.log(`🩺 Health check available at: http://localhost:${port}/${apiPrefix}/health`);
}

bootstrap();
