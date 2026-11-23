/** Funções puras do calendário mensal (sem dependência de React). */

export const pad = (n: number) => String(n).padStart(2, '0');
export const chaveData = (ano: number, mes: number, dia: number) => `${ano}-${pad(mes + 1)}-${pad(dia)}`;

export interface DiaDaGrade { chave: string; dia: number; doMes: boolean }

/** Grade do mês em semanas (domingo a sábado), completando com dias dos meses vizinhos. */
export function gradeDoMes(ano: number, mes: number): DiaDaGrade[][] {
  const primeiro = new Date(ano, mes, 1);
  const inicio = new Date(ano, mes, 1 - primeiro.getDay());
  const semanas: DiaDaGrade[][] = [];
  for (let s = 0; s < 6; s++) {
    const semana: DiaDaGrade[] = [];
    for (let d = 0; d < 7; d++) {
      const dt = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + s * 7 + d);
      semana.push({ chave: chaveData(dt.getFullYear(), dt.getMonth(), dt.getDate()), dia: dt.getDate(), doMes: dt.getMonth() === mes });
    }
    if (s >= 4 && !semana.some((x) => x.doMes)) break; // não mostra semana inteira de outro mês
    semanas.push(semana);
  }
  return semanas;
}

export const NOMES_MES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const DIAS_SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

export const mesAnterior = (ano: number, mes: number) => (mes === 0 ? { ano: ano - 1, mes: 11 } : { ano, mes: mes - 1 });
export const mesSeguinte = (ano: number, mes: number) => (mes === 11 ? { ano: ano + 1, mes: 0 } : { ano, mes: mes + 1 });
