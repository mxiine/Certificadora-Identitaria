'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Erro, Field, PageHeader } from '@/components/ui';
import { api } from '@/lib/api';
import { hoje } from '@/lib/format';

export default function NovoVoluntario() {
  const router = useRouter();
  const [f, setF] = useState({ nome: '', curso: '', contato: '', dataEntrada: hoje(), email: '', senha: '' });
  const [comAcesso, setComAcesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const { email, senha, ...base } = f;
      const v = await api.criarVoluntario(comAcesso ? { ...base, email: email.trim(), senha } : base);
      router.replace(`/voluntarios/${v.id}`);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível salvar.');
      setEnviando(false);
    }
  }

  return (
    <>
      <PageHeader titulo="Cadastrar voluntário" descricao="O acesso ao sistema é opcional e pode ser combinado depois com o voluntário." />
      <form onSubmit={salvar} className="card max-w-2xl space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nome completo"><input className="input" required minLength={3} value={f.nome} onChange={set('nome')} /></Field>
          </div>
          <Field label="Curso"><input className="input" required value={f.curso} onChange={set('curso')} placeholder="Ex.: Análise e Desenvolvimento de Sistemas" /></Field>
          <Field label="Contato"><input className="input" required value={f.contato} onChange={set('contato')} placeholder="Telefone ou e-mail" /></Field>
          <Field label="Data de entrada"><input className="input" type="date" required value={f.dataEntrada} onChange={set('dataEntrada')} /></Field>
        </div>

        <fieldset className="rounded-xl bg-blue-50 p-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-blue-900">
            <input type="checkbox" className="h-4 w-4 accent-blue-700" checked={comAcesso} onChange={(e) => setComAcesso(e.target.checked)} />
            Criar login para este voluntário
          </label>
          {comAcesso && (
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <Field label="E-mail de acesso"><input className="input" type="email" required value={f.email} onChange={set('email')} /></Field>
              <Field label="Senha inicial" hint="Mínimo de 6 caracteres."><input className="input" type="password" required minLength={6} value={f.senha} onChange={set('senha')} /></Field>
            </div>
          )}
        </fieldset>

        <Erro mensagem={erro} />
        <div className="flex gap-3">
          <button className="btn-primary" disabled={enviando}>{enviando ? 'Salvando…' : 'Salvar voluntário'}</button>
          <Link href="/voluntarios" className="btn-ghost">Cancelar</Link>
        </div>
      </form>
    </>
  );
}
