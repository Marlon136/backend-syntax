import express from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use('/payments/webhook', express.raw({ type: 'application/json', limit: '5mb' }));
  // increase default body size limits to allow image data URLs
  app.use(bodyParser.json({ limit: '5mb' }));
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('FRONTEND_URL') || configService.get<string>('APP_URL') || 'https://yntax.vercel.app';
  const allowedOrigins = frontendUrl.split(',').map((origin) => origin.trim());
  app.enableCors({ origin: allowedOrigins, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = configService.get<number>('PORT') || 3001;

  await app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
bootstrap();
