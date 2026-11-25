# TRAMA — Backend

Backend do Projeto TRAMA, sistema de gestão de voluntários e oficinas do projeto de extensão ELLP (UTFPR — Cornélio Procópio).

## Stack

- NestJS + TypeScript
- Prisma + PostgreSQL
- JWT (NestJS Passport) para autenticação
- Docker Compose para o banco local

## Arquitetura
```
src/
├── main.ts              # bootstrap da aplicação
├── app.module.ts         # módulo raiz
├── common/                # filtros, interceptors, decorators, pipes, guards compartilhados
├── config/                 # validação de variáveis de ambiente
├── prisma/                 # PrismaService / PrismaModule (acesso ao banco)
└── modules/                # módulos de feature (voluntários, oficinas, auth) — camadas controller → service → repository
```

## Pré-requisitos

- Node.js 20+
- Docker e Docker Compose

## Setup local

1. Clone o repositório e instale as dependências:

   ```bash
   npm install
   ```

2. Copie o `.env.example` para `.env` e ajuste se necessário:

   ```bash
   cp .env.example .env
   ```

3. Suba o banco de dados PostgreSQL com Docker:

   ```bash
   docker compose up -d
   ```

4. Gere o client do Prisma e rode as migrations:

   ```bash
   npm run prisma:generate
   npm run prisma:migrate:dev
   ```

5. Rode a aplicação em modo desenvolvimento:

   ```bash
   npm run start:dev
   ```

A API sobe em `http://localhost:3333/api`.

## Testes

```bash
npm test          # testes unitários
npm run test:cov  # com cobertura
```

## Deploy (Render)

### 1. Banco de dados

Crie um PostgreSQL gerenciado (Render Postgres, Neon, Supabase...) e copie a connection string: ela vira o `DATABASE_URL`.

- Se o banco também for do Render, use a **Internal Database URL**.
- Planos gratuitos de banco costumam expirar ou pausar. Confira as regras atuais no painel do provedor e crie o banco perto da data da apresentação.

### 2. API (Web Service)

No Render: **New > Web Service**, conecte o repositório do GitHub e configure:

- **Language:** Docker
- **Root Directory:** `backend` (se o repositório tiver front e back)
- **Health Check Path:** `/api/health`
- **Variáveis de ambiente:**

| Variável | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | connection string do banco |
| `JWT_SECRET` | segredo forte (gere com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | URL do front na Vercel (várias origens separadas por vírgula) |

Não defina `PORT`: o Render injeta sozinho. A cada deploy o container roda `prisma migrate deploy` antes de subir a API.

### 3. Primeiro coordenador (seed)

Rode **uma vez**, da sua máquina, apontando pro banco de produção (PowerShell):

```powershell
$env:DATABASE_URL="<connection string EXTERNA do banco>"
$env:SEED_COORDENADOR_EMAIL="coordenacao@ellp.utfpr.edu.br"
$env:SEED_COORDENADOR_SENHA="<uma senha forte>"
npx prisma db seed
```

Depois **feche o terminal**, para não rodar um `migrate dev` apontando por engano pro banco de produção.

### 4. Front (Vercel)

Aponte a variável de URL da API do front para `https://<seu-servico>.onrender.com/api` e coloque a URL da Vercel no `FRONTEND_URL` da API.

### 5. Antes da demonstração

O Web Service gratuito dorme depois de um tempo sem tráfego e leva cerca de 1 minuto pra acordar. Abra `/api/health` alguns minutos antes de apresentar.