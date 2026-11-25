import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = process.env.SEED_COORDENADOR_EMAIL ?? 'coordenador@ellp.utfpr.edu.br';
    const senha = process.env.SEED_COORDENADOR_SENHA ?? 'coordenador123';

    const bancoLocal = (process.env.DATABASE_URL ?? '').includes('localhost');
    if (!bancoLocal && !process.env.SEED_COORDENADOR_SENHA) {
        throw new Error('Defina SEED_COORDENADOR_SENHA para rodar o seed fora do banco local');
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await prisma.usuario.upsert({
        where: { email },
        update: {},
        create: { email, senhaHash, perfil: 'COORDENADOR' },
    });

    console.log(`Coordenador pronto: ${email}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });