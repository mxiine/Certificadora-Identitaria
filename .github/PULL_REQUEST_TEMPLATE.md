## 📝 O que foi mudado?
-

## 💼 Regra de Negócio
>

## 🔗 Card relacionado
> Link do card no GitHub Projects (Kanban)

## 🏗️ Arquitetura e Padrões
- [ ] O código respeita a arquitetura definida no projeto (Controller → Service → Repository)?
- [ ] Não há código morto nem `console.log` esquecido?
- [ ] Tipagem e padrões de nomenclatura foram respeitados?

## 🚀 Impacto
- [ ] **Breaking Change?** (Altera rotas ou contratos existentes que podem quebrar o Front?)
- [ ] **Mudança no Banco de Dados?** (Necessário rodar `npx prisma migrate dev` dentro de `backend/`)
- [ ] **Nova Variável de Ambiente?** (Necessário atualizar o `.env.example` e o `.env`)

## 🏷️ Organização do PR
- [ ] Labels corretas aplicadas (`backend`, `frontend`, `feature`, `bug`, `chore`)

## 🧪 Como testar?
1. [ ] `git checkout nome-da-branch`
2. [ ] Dentro de `backend/`: `npm install && npx prisma migrate dev`
3. [ ] Teste o endpoint/funcionalidade: `[descreva aqui]`
4. [ ] Verifique o terminal/console para garantir que não há erros

## 📸 Evidências
> Print ou vídeo mostrando o funcionamento da alteração (ex: chamada no Postman/Insomnia, tela do front).

---
*Relatado por: @usuario*