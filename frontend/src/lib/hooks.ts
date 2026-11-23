'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './auth';
import { atendimentosApi, oficinasApi, vinculosApi } from './oficinas';
import type { Atendimento, Oficina, Vinculo } from './types';

/**
 * Carrega oficinas, vínculos e atendimentos já respeitando o perfil:
 * coordenação vê tudo; voluntário vê só as oficinas em que está vinculado.
 */
export function useDadosOficinas() {
  const { usuario } = useAuth();
  const [dados, setDados] = useState<{ oficinas: Oficina[]; vinculos: Vinculo[]; atendimentos: Atendimento[] } | null>(null);

  const recarregar = useCallback(async () => {
    const [oficinas, vinculos, atendimentos] = await Promise.all([oficinasApi.listar(), vinculosApi.listar(), atendimentosApi.listar()]);
    if (usuario?.perfil === 'VOLUNTARIO') {
      const meus = vinculos.filter((v) => v.voluntarioId === usuario.voluntarioId);
      const ids = new Set(meus.map((v) => v.oficinaId));
      setDados({ oficinas: oficinas.filter((o) => ids.has(o.id)), vinculos: meus, atendimentos: atendimentos.filter((a) => ids.has(a.oficinaId)) });
    } else {
      setDados({ oficinas, vinculos, atendimentos });
    }
  }, [usuario]);

  useEffect(() => { recarregar(); }, [recarregar]);
  return { ...dados, carregando: dados === null, recarregar };
}
