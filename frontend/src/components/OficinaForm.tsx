'use client';

import { useState } from 'react';
import { Erro, Field } from './ui';
import { hoje } from '@/lib/format';
import type { NovaOficina } from '@/lib/types';

const vazia: NovaOficina = { tema: '', descricao: '', data: hoje(), horaInicio: '09:00', horas: 4, local: 'UTFPR - Cornélio Procópio', professor: '' };

export function OficinaForm({ inicial, rotuloBotao, onSubmit, onCancel }: {
  inicial?: NovaOficina;
  rotuloBotao: string;
  onSubmit: (dto: NovaOficina) => Promise<void>;
  onCancel: () => void;
}) {
  const [f, setF] = useState<NovaOficina>(inicial ?? vazia);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const set = <K extends keyof NovaOficina>(k: K, v: NovaOficina[K]) => setF((s) => ({ ...s, [k]: v }));

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await onSubmit({ ...f, tema: f.tema.trim(), professor: f.professor.trim() });
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível salvar.');
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="card max-w-3xl space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Tema da oficina"><input className="input" required value={f.tema} onChange={(e) => set('tema', e.target.value)} placeholder="Ex.: Robótica com LEGO" /></Field>
        </div>
        <Field label="Data"><input className="input" type="date" required value={f.data} onChange={(e) => set('data', e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Início"><input className="input" type="time" value={f.horaInicio} onChange={(e) => set('horaInicio', e.target.value)} /></Field>
          <Field label="Duração (horas)"><input className="input" type="number" min={0.5} max={24} step={0.5} required value={f.horas} onChange={(e) => set('horas', Number(e.target.value))} /></Field>
        </div>
        <Field label="Professor(a) responsável"><input className="input" required value={f.professor} onChange={(e) => set('professor', e.target.value)} /></Field>
        <Field label="Local"><input className="input" value={f.local} onChange={(e) => set('local', e.target.value)} /></Field>
        <div className="sm:col-span-2">
          <Field label="Descrição (opcional)"><textarea className="input min-h-24" value={f.descricao} onChange={(e) => set('descricao', e.target.value)} /></Field>
        </div>
      </div>
      <Erro mensagem={erro} />
      <div className="flex gap-3">
        <button className="btn-primary" disabled={enviando}>{enviando ? 'Salvando…' : rotuloBotao}</button>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
