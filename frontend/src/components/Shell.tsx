'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { homeDoPerfil, useAuth } from '@/lib/auth';
import { APP_NAME } from '@/lib/config';
import type { Perfil } from '@/lib/types';
import { Carregando } from './ui';

const NAV: { href: string; rotulo: string; perfis: Perfil[] }[] = [
  { href: '/painel', rotulo: 'Painel de impacto', perfis: ['COORDENADOR'] },
  { href: '/voluntarios', rotulo: 'Voluntários', perfis: ['COORDENADOR'] },
  { href: '/oficinas', rotulo: 'Oficinas', perfis: ['COORDENADOR', 'VOLUNTARIO'] },
  { href: '/calendario', rotulo: 'Calendário', perfis: ['COORDENADOR', 'VOLUNTARIO'] },
  { href: '/meu-historico', rotulo: 'Meu histórico', perfis: ['VOLUNTARIO'] },
];

/** Protege as rotas: sem login → /login; perfil errado → home do perfil. */
export function Shell({ children }: { children: React.ReactNode }) {
  const { usuario, ready, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const itens = NAV.filter((i) => usuario && i.perfis.includes(usuario.perfil));
  const permitido = !usuario || itens.some((i) => pathname.startsWith(i.href));

  useEffect(() => {
    if (!ready) return;
    if (!usuario) router.replace('/login');
    else if (!permitido) router.replace(homeDoPerfil(usuario.perfil));
  }, [ready, usuario, permitido, router]);

  if (!ready || !usuario || !permitido) return <Carregando />;

  return (
    <div className="min-h-screen md:flex">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-orange-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-blue-950">
        Pular para o conteúdo
      </a>
      <aside className="bg-blue-900 text-blue-100 md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0">
        <div className="flex items-center justify-between px-5 py-4 md:block md:py-7">
          <Link href={homeDoPerfil(usuario.perfil)} className="block">
            <span className="font-display text-2xl font-bold text-white">ELLP</span>
            <span className="ml-2 font-display text-sm text-orange-400">{APP_NAME.toLowerCase()}()</span>
          </Link>
          <button onClick={() => { logout(); router.replace('/login'); }} className="text-sm text-blue-200 underline md:hidden">
            Sair
          </button>
        </div>
        <nav aria-label="Principal" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {itens.map((i) => {
            const ativo = pathname.startsWith(i.href);
            return (
              <Link
                key={i.href}
                href={i.href}
                aria-current={ativo ? 'page' : undefined}
                className={`whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  ativo ? 'bg-orange-500 text-blue-950' : 'hover:bg-blue-800'
                }`}
              >
                {i.rotulo}
              </Link>
            );
          })}
        </nav>
        <div className="hidden px-5 pt-8 md:absolute md:bottom-6 md:block md:w-64">
          <p className="truncate text-xs text-blue-300">{usuario.email}</p>
          <p className="mb-3 text-xs text-blue-300">{usuario.perfil === 'COORDENADOR' ? 'Coordenação' : 'Voluntário(a)'}</p>
          <button onClick={() => { logout(); router.replace('/login'); }} className="btn-ghost w-full !bg-transparent !text-blue-100 !border-blue-700 hover:!bg-blue-800">
            Sair
          </button>
        </div>
      </aside>
      <main id="conteudo" tabIndex={-1} className="min-w-0 flex-1 px-5 py-8 outline-none md:px-10">{children}</main>
    </div>
  );
}
