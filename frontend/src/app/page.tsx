'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { homeDoPerfil, useAuth } from '@/lib/auth';
import { Carregando } from '@/components/ui';

export default function Inicio() {
  const { usuario, ready } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (ready) router.replace(usuario ? homeDoPerfil(usuario.perfil) : '/login');
  }, [ready, usuario, router]);
  return <Carregando />;
}
