import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module';
import { configureApp } from './config/configure-app';
import { env } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { instrument: ObserveInstrument });
  configureApp(app);
  app.enableShutdownHooks();
  await app.listen(env.port);
}
void bootstrap();
