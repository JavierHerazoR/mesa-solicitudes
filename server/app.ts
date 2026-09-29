import 'reflect-metadata';
import { BadRequestException, Controller, Get, Module, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseService } from './database.service';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';

@Controller('health')
class HealthController {
  @Get()
  health() {
    return { status: 'ok' };
  }
}

@Module({
  controllers: [RequestsController, HealthController],
  providers: [DatabaseService, RequestsService],
})
class AppModule {}

export async function createApp() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error'],
    abortOnError: false,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) =>
        new BadRequestException(
          errors.flatMap((error) =>
            Object.entries(error.constraints ?? {}).map(([constraint, message]) =>
              constraint === 'whitelistValidation'
                ? `El campo «${error.property}» no está permitido.`
                : message,
            ),
          ),
        ),
    }),
  );
  const clientDirectory = join(process.cwd(), 'dist/client');
  if (existsSync(clientDirectory)) app.useStaticAssets(clientDirectory);
  app.enableShutdownHooks();
  return app;
}
