import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';
import { dataBR, horasBR } from './format';
import type { Oficina, Voluntario } from './types';

const AZUL = rgb(0.086, 0.231, 0.576);
const LARANJA = rgb(1, 0.54, 0.12);

function quebrar(texto: string, fonte: PDFFont, tamanho: number, largura: number): string[] {
  const linhas: string[] = [];
  let atual = '';
  for (const palavra of texto.split(/\s+/)) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra;
    if (fonte.widthOfTextAtSize(tentativa, tamanho) > largura && atual) {
      linhas.push(atual);
      atual = palavra;
    } else atual = tentativa;
  }
  if (atual) linhas.push(atual);
  return linhas;
}

/** Gera o termo de voluntariado em PDF no navegador (pdf-lib) e dispara o download. */
export async function baixarTermo(v: Voluntario, oficinas: Oficina[], horas: number) {
  const pdf = await PDFDocument.create();
  const pagina = pdf.addPage([595, 842]);
  const normal = await pdf.embedFont(StandardFonts.Helvetica);
  const negrito = await pdf.embedFont(StandardFonts.HelveticaBold);
  const margem = 64;
  const largura = 595 - margem * 2;
  let y = 842;

  pagina.drawRectangle({ x: 0, y: 842 - 110, width: 595, height: 110, color: AZUL });
  pagina.drawRectangle({ x: 0, y: 842 - 116, width: 595, height: 6, color: LARANJA });
  pagina.drawText('ELLP', { x: margem, y: 842 - 62, size: 32, font: negrito, color: rgb(1, 1, 1) });
  pagina.drawText('Ensino Lúdico de Lógica e Programação · UTFPR Cornélio Procópio', {
    x: margem, y: 842 - 84, size: 10, font: normal, color: rgb(0.86, 0.91, 1),
  });
  y = 842 - 170;

  pagina.drawText('TERMO DE VOLUNTARIADO', { x: margem, y, size: 18, font: negrito, color: AZUL });
  y -= 36;

  const periodo = v.dataSaida
    ? `de ${dataBR(v.dataEntrada)} a ${dataBR(v.dataSaida)}`
    : `desde ${dataBR(v.dataEntrada)}, com atuação em andamento`;
  const paragrafo =
    `Declaramos que ${v.nome}, estudante do curso de ${v.curso}, atuou como voluntário(a) no projeto de extensão ` +
    `ELLP (Ensino Lúdico de Lógica e Programação) da Universidade Tecnológica Federal do Paraná, Campus Cornélio Procópio, ` +
    `no período ${periodo}, totalizando ${horasBR(horas)} de atividades voluntárias, sem vínculo empregatício ` +
    `e sem remuneração, nos termos da Lei nº 9.608/1998.`;
  for (const l of quebrar(paragrafo, normal, 12, largura)) {
    pagina.drawText(l, { x: margem, y, size: 12, font: normal, color: rgb(0.04, 0.13, 0.33) });
    y -= 19;
  }

  y -= 14;
  pagina.drawText('Oficinas em que atuou', { x: margem, y, size: 13, font: negrito, color: AZUL });
  y -= 22;
  if (oficinas.length === 0) {
    pagina.drawText('Nenhuma oficina registrada até o momento.', { x: margem, y, size: 11, font: normal });
    y -= 18;
  }
  for (const o of oficinas.slice(0, 18)) {
    pagina.drawText(`${dataBR(o.data)}  ·  ${o.tema}  (${horasBR(o.horas)})`, {
      x: margem, y, size: 11, font: normal, color: rgb(0.04, 0.13, 0.33),
    });
    y -= 17;
  }
  if (oficinas.length > 18) {
    pagina.drawText(`… e mais ${oficinas.length - 18} oficinas.`, { x: margem, y, size: 10, font: normal });
  }

  const base = 150;
  pagina.drawLine({ start: { x: margem, y: base }, end: { x: margem + 210, y: base }, thickness: 0.8, color: AZUL });
  pagina.drawText('Coordenação do ELLP', { x: margem, y: base - 14, size: 10, font: normal });
  pagina.drawLine({ start: { x: 595 - margem - 210, y: base }, end: { x: 595 - margem, y: base }, thickness: 0.8, color: AZUL });
  pagina.drawText(v.nome, { x: 595 - margem - 210, y: base - 14, size: 10, font: normal });
  pagina.drawText(`Emitido em ${new Date().toLocaleDateString('pt-BR')}`, {
    x: margem, y: 60, size: 9, font: normal, color: rgb(0.4, 0.5, 0.7),
  });

  const bytes = await pdf.save();
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `termo-voluntariado-${v.nome.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-')}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
