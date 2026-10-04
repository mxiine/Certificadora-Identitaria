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

## Próximos passos

Os módulos de domínio (Voluntários, Oficinas, Auth) serão implementados no PR de desenvolvimento inicial, seguindo a arquitetura em camadas descrita acima.