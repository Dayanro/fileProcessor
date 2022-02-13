import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Transport, MicroserviceOptions } from "@nestjs/microservices";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ExceptionFilter } from "./shared/filter/rpc-exception.filter";

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: "127.0.0.1",
      port: 8877,
    },
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new ExceptionFilter());
  await app.listen();
  logger.log(`Application listening on port ${8877}`);
}
bootstrap();
