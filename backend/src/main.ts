import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
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

    const config = new DocumentBuilder()
        .setTitle('TRAMA — API')
        .setDescription('API do sistema de gestão de voluntários e oficinas do ELLP')
        .setVersion('0.1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT ?? 3333;
    await app.listen(port);

    Logger.log(`🚀 TRAMA backend rodando em http://localhost:${port}/api`, 'Bootstrap');
    Logger.log(`📖 Swagger disponível em http://localhost:${port}/api/docs`, 'Bootstrap');
}

bootstrap();