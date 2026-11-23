'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { OficinaForm } from '@/components/OficinaForm';
import { Carregando, PageHeader, SemPermissao, Vazio } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { oficinasApi } from '@/lib/oficinas';
import type { Oficina } from '@/lib/types';

export default function EditarOficina() {
  const { id } = useParams<{ id: string }>();
  const { usuario } = useAuth();
  const router = useRouter();
  const [o, setO] = useState<Oficina | null | undefined>(undefined);
  useEffect(() => { oficinasApi.buscar(id).then(setO); }, [id]);

  if (usuario?.perfil !== 'COORDENADOR') return <SemPermissao />;
  if (o === undefined) return <Carregando />;
  if (o === null) return <Vazio titulo="Oficina não encontrada" texto="Ela pode ter sido removida." />;
  const { id: _id, ...inicial } = o;
  return (
    <>
      <PageHeader titulo="Editar oficina" descricao={o.tema} />
      <OficinaForm
        inicial={inicial}
        rotuloBotao="Salvar alterações"
        onCancel={() => router.push(`/oficinas/${id}`)}
        onSubmit={async (dto) => { await oficinasApi.editar(id, dto); router.replace(`/oficinas/${id}`); }}
      />
    </>
  );
}
