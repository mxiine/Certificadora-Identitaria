import { dataDentroDoPeriodo } from './periodo.util';

describe('dataDentroDoPeriodo', () => {
    const inicio = new Date('2026-10-01');
    const fim = new Date('2026-12-01');

    it('aceita data dentro do período', () => {
        expect(dataDentroDoPeriodo(new Date('2026-11-14'), inicio, fim)).toBe(true);
    });

    it('aceita as datas de início e de fim (limites inclusivos)', () => {
        expect(dataDentroDoPeriodo(inicio, inicio, fim)).toBe(true);
        expect(dataDentroDoPeriodo(fim, inicio, fim)).toBe(true);
    });

    it('recusa data antes da entrada do voluntário', () => {
        expect(dataDentroDoPeriodo(new Date('2026-09-30'), inicio, fim)).toBe(false);
    });

    it('recusa data depois da saída do voluntário', () => {
        expect(dataDentroDoPeriodo(new Date('2026-12-02'), inicio, fim)).toBe(false);
    });

    it('sem data de saída, qualquer data a partir da entrada vale', () => {
        expect(dataDentroDoPeriodo(new Date('2030-01-01'), inicio, null)).toBe(true);
        expect(dataDentroDoPeriodo(new Date('2030-01-01'), inicio)).toBe(true);
    });
});