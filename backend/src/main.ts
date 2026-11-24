import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.set('trust proxy', 1);

    app.use(helmet({ contentSecurityPolicy: false }));

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    const origens = (process.env.FRONTEND_URL ?? 'http://localhost:3000')
        .split(',')
        .map((origem) => origem.trim())
        .filter(Boolean);

    app.enableCors({ origin: origens, credentials: true });

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