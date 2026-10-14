# Ajuste necessário no back-end (3 linhas)

O login do voluntário devolve `{ id, email, perfil }`, mas **não** o id do cadastro de voluntário.
Sem isso, a tela "Meu histórico" não sabe qual voluntário buscar. O front já está pronto para ler `usuario.voluntarioId`.

Em `backend/src/modules/auth/auth.service.ts`, troque o retorno do `login` por:

```ts
return {
    accessToken: await this.jwtService.signAsync(payload),
    usuario: {
        id: usuario.id,
        email: usuario.email,
        perfil: usuario.perfil,
        voluntarioId: usuario.voluntarioId, // <- adicionar
    },
};
```

## Outros pontos que vi no back (fora do escopo do front)

- `GET /voluntarios/:id` aceita `VOLUNTARIO`, mas não confere se o id é o dele: qualquer voluntário logado lê o cadastro de qualquer outro.
- `cargaHorariaTotal` não pode ser alterada por nenhum DTO (e `forbidNonWhitelisted` bloqueia), então vem sempre 0. Hoje o front calcula as horas pelas oficinas.
- Não existem endpoints de oficinas nem de indicadores. O front usa `src/lib/oficinas.ts` (localStorage) até eles existirem.
