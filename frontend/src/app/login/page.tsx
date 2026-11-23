'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Shapes } from '@/components/Shapes';
import { Erro, Field } from '@/components/ui';
import { homeDoPerfil, useAuth } from '@/lib/auth';
import { APP_NAME } from '@/lib/config';

export default function Login() {
  const { login, usuario, ready } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (ready && usuario) router.replace(homeDoPerfil(usuario.perfil));
  }, [ready, usuario, router]);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const u = await login(email.trim(), senha);
      router.replace(homeDoPerfil(u.perfil));
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.15fr_1fr]">
      <section className="relative overflow-hidden bg-blue-800 px-8 py-10 text-white lg:px-16 lg:py-16">
        <Shapes className="pointer-events-none absolute inset-0 h-full w-full opacity-90 [mask-image:linear-gradient(to_bottom,transparent_0%,black_30%)] lg:[mask-image:none]" />
        <div className="relative flex h-full max-w-xl flex-col justify-between gap-16">
          <p className="font-display text-3xl font-extrabold">ELLP</p>
          <div>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              ensino.lúdico
              <span className="block text-orange-400">(lógica.programação)</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-blue-100">
              Cadastro de voluntários, oficinas e termos num só lugar, para o projeto continuar levando programação às crianças de Cornélio Procópio.
            </p>
          </div>
          <p className="text-sm text-blue-200">UTFPR · Campus Cornélio Procópio</p>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <form onSubmit={entrar} className="w-full max-w-sm space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-blue-900">Entrar no {APP_NAME}</h2>
            <p className="mt-1 text-sm text-blue-700">Use o e-mail e a senha que a coordenação cadastrou para você.</p>
          </div>
          <Field label="E-mail">
            <input className="input" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Senha">
            <input className="input" type="password" autoComplete="current-password" required minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)} />
          </Field>
          <Erro mensagem={erro} />
          <button className="btn-primary w-full" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
        </form>
      </section>
    </div>
  );
}
