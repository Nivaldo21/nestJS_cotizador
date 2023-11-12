import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiModule } from './api/api.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
