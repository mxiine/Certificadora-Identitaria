'use client';

import { useRouter } from 'next/navigation';
import { OficinaForm } from '@/components/OficinaForm';
import { PageHeader, SemPermissao } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { oficinasApi } from '@/lib/oficinas';

export default function NovaOficina() {
  const { usuario } = useAuth();
  const router = useRouter();
  if (usuario?.perfil !== 'COORDENADOR') return <SemPermissao />;
  return (
    <>
      <PageHeader titulo="Nova oficina" descricao="Depois de salvar, você vincula os voluntários e registra os atendimentos." />
      <OficinaForm
        rotuloBotao="Salvar oficina"
        onCancel={() => router.push('/oficinas')}
        onSubmit={async (dto) => { const o = await oficinasApi.criar(dto); router.replace(`/oficinas/${o.id}`); }}
      />
    </>
  );
}
