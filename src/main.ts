import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('MS_PAYMENTS');
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // mandar body como buffer
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.NATS,
      options: {
        servers: envs.natsServers,
      },
    },
    { inheritAppConfig: true }, // heredar configuracion de la app https://docs.nestjs.com/faq/hybrid-application#sharing-configuration
  );

  // levantar todos los microservicios configurados
  await app.startAllMicroservices();

  await app.listen(envs.port);
  logger.log(`Running on port ${envs.port}`);
}
bootstrap();
