import { Test } from '@nestjs/testing';
import { PrismaService } from './prisma/prisma.service';

jest.mock('bcrypt', () => ({ hash: jest.fn(), compare: jest.fn() }));

describe('AppModule', () => {
    it('monta todos os módulos sem conectar no banco', async () => {
        process.env.DATABASE_URL = 'postgresql://usuario:senha@localhost:5432/teste';
        process.env.JWT_SECRET = 'segredo-de-teste-com-mais-de-16-caracteres';
        const { AppModule } = await import('./app.module');

        const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
            .overrideProvider(PrismaService)
            .useValue({})
            .compile();

        expect(moduleRef.get(PrismaService)).toBeDefined();
        await moduleRef.close();
    });
});