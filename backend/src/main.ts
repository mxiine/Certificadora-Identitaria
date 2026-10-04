import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.enableCors({
        origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
        credentials: true,
    });

    app.setGlobalPrefix('api');

    const port = process.env.PORT ?? 3333;
    await app.listen(port);

    Logger.log(`🚀 TRAMA backend rodando em http://localhost:${port}/api`, 'Bootstrap');
}

bootstrap();