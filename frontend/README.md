# TRAMA — Front-end

Next.js 14 (App Router) + TypeScript + Tailwind CSS. Gera o termo de voluntariado em PDF com `pdf-lib`.

## Rodando

1. Suba o back-end (`backend/README.md`) e rode `npm run prisma:seed` para criar o coordenador
   (`coordenador@ellp.utfpr.edu.br` / `coordenador123`).
2. Aqui no front:
   ```bash
   npm install
   cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:3333/api
   npm run dev                         # http://localhost:3000
   ```
   O CORS do back já libera `http://localhost:3000`.

## Estrutura

```
src/
├── app/
│   ├── login/                 login (coordenador e voluntário)
│   └── (app)/                 área logada, protegida por <Shell>
│       ├── painel/            dashboard de impacto
│       ├── voluntarios/       lista, cadastro, detalhe/edição/desligar/termo
│       ├── oficinas/          lista, nova, [id] (detalhes, vínculos, atendimentos), [id]/editar
│       ├── calendario/        calendário mensal
│       └── meu-historico/     visão do voluntário
├── components/                Shell (menu + guarda de rota), ui, Shapes, charts, Calendario, OficinaForm
└── lib/
    ├── api.ts                 cliente da API (JWT, erros do Nest)
    ├── auth.tsx               sessão e perfis
    ├── oficinas.ts            ⚠ localStorage (oficinas, vínculos, atendimentos); trocar por API (ver API-OFICINAS.md)
    ├── calendario.ts          grade do mês (funções puras)
    ├── hooks.ts               carrega dados já filtrados por perfil
    └── termo.ts               PDF do termo
```

Nome do sistema em `src/lib/config.ts`. Cores em `tailwind.config.ts`.
Leia também `API-OFICINAS.md` (contrato sugerido para o back) e `../backend-fixes.patch`.
