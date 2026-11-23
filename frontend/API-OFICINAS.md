# Contrato sugerido da API (Oficinas, Vínculos, Atendimentos)

O front hoje guarda esses dados no `localStorage` (`src/lib/oficinas.ts`). Quando o back tiver os
endpoints abaixo, basta trocar o corpo de cada função desse arquivo por `fetch`; as telas não mudam
(todas as funções já são `async`). Perfis: **C** = COORDENADOR, **V** = VOLUNTARIO.

| Método | Rota | Perfis | Observação |
|---|---|---|---|
| GET | `/oficinas` | C (todas) · V (só as vinculadas a ele) | ordenar por data desc |
| GET | `/oficinas/:id` | C · V (se vinculado) | 403 se o voluntário não for vinculado |
| POST | `/oficinas` | C | `{ tema, descricao, data, horaInicio, horas, local, professor }` |
| PATCH | `/oficinas/:id` | C | ao reduzir `horas`, limitar as horas dos vínculos |
| DELETE | `/oficinas/:id` | C | cascata: remove vínculos e atendimentos |
| GET | `/oficinas/:id/vinculos` | C · V (só o próprio) | |
| POST | `/oficinas/:id/vinculos` | C | `{ voluntarioId, papel, horas }` |
| PATCH | `/vinculos/:id` | C | `{ papel, horas }` |
| DELETE | `/vinculos/:id` | C | |
| GET | `/voluntarios/:id/vinculos` | C · V (só o próprio id) | usado por "Meu histórico" e pelo termo |
| GET | `/oficinas/:id/atendimentos` | C · V (se vinculado) | |
| POST | `/oficinas/:id/atendimentos` | C | `{ instituicao, quantidade, observacao }` |
| DELETE | `/atendimentos/:id` | C | |

`papel`: `TUTOR` \| `MONITOR` \| `APOIO`.

## Regras do vínculo (o front já valida; o back precisa repetir)

1. Um voluntário só pode ser vinculado **uma vez** a cada oficina (único em `oficinaId + voluntarioId`).
2. Só voluntários **ATIVOS** podem ser vinculados a novas oficinas (inativos continuam no histórico).
3. A data da oficina deve estar entre `dataEntrada` e `dataSaida` do voluntário.
4. `horas` do vínculo: maior que 0 e no máximo a duração da oficina.
5. Excluir oficina remove seus vínculos e atendimentos.

## Atendimento

`quantidade` inteira ≥ 1; `instituicao` obrigatória. Total de crianças da oficina = soma dos atendimentos.

## Horas do voluntário

Soma das `horas` dos vínculos. Sugestão: o back calcular `cargaHorariaTotal` por essa soma (hoje o campo
fica sempre 0 porque nenhum DTO permite alterá-lo).
