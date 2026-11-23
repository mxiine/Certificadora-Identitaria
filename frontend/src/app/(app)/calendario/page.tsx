'use client';

import { Calendario } from '@/components/Calendario';
import { Carregando, PageHeader } from '@/components/ui';
import { useDadosOficinas } from '@/lib/hooks';

export default function PaginaCalendario() {
  const { oficinas, carregando } = useDadosOficinas();
  return (
    <>
      <PageHeader titulo="Calendário" descricao="Oficinas por dia. Selecione um dia para ver os detalhes." />
      {carregando ? <Carregando /> : <Calendario oficinas={oficinas ?? []} />}
    </>
  );
}
