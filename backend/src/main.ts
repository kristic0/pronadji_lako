import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as cookieParser from 'cookie-parser';
import { SeederService } from '../seeder/seeder.service';
import { HttpExceptionFilter } from './http-exception.filter';
import * as path from 'path';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger(AppModule.name);
  const seederService = app.get(SeederService);
  const config = new DocumentBuilder().setTitle('Pronadji lako').build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      const isProd = process.env.NODE_ENV === 'production';

      const allowedOrigins = isProd ? ['http://pronadjilako.rs', 'http://pronadjidadilju.rs'] : '*'; // Allow all origins in development

      if (!origin || allowedOrigins === '*' || allowedOrigins.includes(origin)) {
        // Allow if it's a non-browser request (Postman, curl) or in development
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Allow cookies to be sent
    allowedHeaders: 'Content-Type, Authorization',
  };

  // DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      //If a request contains extra fields that are not present in the DTO,
      //those fields are automatically stripped out before the data is passed to the controller.
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (validationErrors = []) => {
        validationErrors.forEach((error) => {
          const targetClass = error.target?.constructor?.name || 'UnknownDTO';
          logger.error(`Validation error in ${targetClass}. ` + error);
        });
        return new BadRequestException('Invalid request');
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors(corsOptions);
  app.use(cookieParser());

  await app.listen(process.env.APP_PORT ?? 4000);

  if (process.env.NODE_ENV !== 'production') {
    logger.log('Seeder service started!');

    await seederService.seedMunicipalities();
    await seederService.seedCities();
    await seederService.seedStreets();
    // await seederService.seedPostOfficeData();
    await seederService.seedUsers();

    logger.log('Finished seeding procedure!');
  }
}
bootstrap();
