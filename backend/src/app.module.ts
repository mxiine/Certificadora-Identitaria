import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { VoluntariosModule } from './modules/voluntarios/voluntarios.module';
import { OficinasModule } from './modules/oficinas/oficinas.module';
import { VinculosModule } from './modules/vinculos/vinculos.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            validationSchema: envValidationSchema,
        }),
        PrismaModule,
        AuthModule,
        VoluntariosModule,
        OficinasModule,
        VinculosModule,
    ],
})
export class AppModule { }