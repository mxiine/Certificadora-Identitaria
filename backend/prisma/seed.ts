import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const senhaHash = await bcrypt.hash('coordenador123', 10);

    await prisma.usuario.upsert({
        where: { email: 'coordenador@ellp.utfpr.edu.br' },
        update: {},
        create: {
            email: 'coordenador@ellp.utfpr.edu.br',
            senhaHash,
            perfil: 'COORDENADOR',
        },
    });

    console.log('Usuário coordenador criado/atualizado com sucesso');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });