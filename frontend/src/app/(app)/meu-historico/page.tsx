'use client';

import { useEffect, useState } from 'react';
import { Badge, Carregando, Erro, Metrica, PageHeader, Vazio } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { dataBR, horasBR } from '@/lib/format';
import Link from 'next/link';
import { horasDoVoluntario, rotuloPapel, vinculosApi } from '@/lib/oficinas';
import { baixarTermo } from '@/lib/termo';
import type { Oficina, Vinculo, Voluntario } from '@/lib/types';

export default function MeuHistorico() {
  const { usuario } = useAuth();
  const voluntarioId = usuario?.voluntarioId;
  const [v, setV] = useState<Voluntario | null>(null);
  const [itens, setItens] = useState<{ vinculo: Vinculo; oficina: Oficina }[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!voluntarioId) return;
    vinculosApi.doVoluntario(voluntarioId).then(setItens);
    api.buscarVoluntario(voluntarioId).then(setV).catch((e) => setErro(e.message));
  }, [voluntarioId]);

  if (!voluntarioId) {
    return (
      <>
        <PageHeader titulo="Meu histórico" />
        <Vazio
          titulo="Não encontramos seu cadastro de voluntário"
          texto="O login não informou a qual voluntário ele pertence. Peça à coordenação para conferir seu cadastro."
        />
      </>
    );
  }
  if (!v) return erro ? <Erro mensagem={erro} /> : <Carregando />;
  const oficinas = itens.map((i) => i.oficina);
  const horas = horasDoVoluntario(v, itens.map((i) => i.vinculo));

  return (
    <>
      <PageHeader
        titulo={`Olá, ${v.nome.split(' ')[0]}`}
        descricao="Seu histórico no ELLP. Baixe o termo de voluntariado quando precisar."
        acao={<button className="btn-accent" onClick={() => baixarTermo(v, oficinas, horas)}>Baixar meu termo (PDF)</button>}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Metrica destaque valor={horasBR(horas)} rotulo="horas de voluntariado" />
        <Metrica valor={oficinas.length} rotulo="oficinas em que atuou" />
        <div className="card flex flex-col justify-center gap-2">
          <Badge ativo={v.status === 'ATIVO'} />
          <p className="text-sm text-blue-700">Desde {dataBR(v.dataEntrada)}{v.dataSaida ? ` até ${dataBR(v.dataSaida)}` : ''}</p>
        </div>
      </div>
      <section className="card mt-6">
        <h2 className="mb-3 text-lg font-semibold text-blue-900">Oficinas</h2>
        {oficinas.length === 0 ? (
          <p className="text-sm text-blue-700">Ainda não há oficinas registradas para você.</p>
        ) : (
          <ul className="divide-y divide-blue-100">
            {itens.map(({ oficina: o, vinculo }) => (
              <li key={o.id} className="flex justify-between gap-3 py-2.5 text-sm">
                <span><Link href={`/oficinas/${o.id}`} className="font-semibold text-blue-900 underline-offset-2 hover:underline">{o.tema}</Link><span className="block text-blue-600">{dataBR(o.data)} · {rotuloPapel(vinculo.papel)}</span></span>
                <span className="shrink-0 text-blue-700">{horasBR(vinculo.horas)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
