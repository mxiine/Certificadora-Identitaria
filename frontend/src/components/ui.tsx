import type { ReactNode } from 'react';

export function PageHeader({ titulo, descricao, acao }: { titulo: string; descricao?: string; acao?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-blue-900 md:text-3xl">{titulo}</h1>
        {descricao && <p className="mt-1 max-w-xl text-sm text-blue-700">{descricao}</p>}
      </div>
      {acao}
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-blue-900">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-blue-600">{hint}</span>}
    </label>
  );
}

export function Badge({ ativo }: { ativo: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        ativo ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-700'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${ativo ? 'bg-blue-600' : 'bg-orange-500'}`} />
      {ativo ? 'Ativo' : 'Inativo'}
    </span>
  );
}

export function Erro({ mensagem }: { mensagem: string | null }) {
  if (!mensagem) return null;
  return (
    <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
      {mensagem}
    </p>
  );
}

export function Carregando({ texto = 'Carregando…' }: { texto?: string }) {
  return <p className="py-10 text-center text-sm text-blue-600">{texto}</p>;
}

export function Vazio({ titulo, texto, acao }: { titulo: string; texto: string; acao?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center py-12 text-center">
      <p className="font-display text-lg font-semibold text-blue-900">{titulo}</p>
      <p className="mt-1 max-w-sm text-sm text-blue-700">{texto}</p>
      {acao && <div className="mt-4">{acao}</div>}
    </div>
  );
}

export function Metrica({ valor, rotulo, destaque }: { valor: string | number; rotulo: string; destaque?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 ${destaque ? 'bg-blue-800 text-white' : 'border border-blue-100 bg-white'}`}>
      <p className={`font-display text-4xl font-bold ${destaque ? 'text-orange-400' : 'text-blue-800'}`}>{valor}</p>
      <p className={`mt-1 text-sm ${destaque ? 'text-blue-100' : 'text-blue-700'}`}>{rotulo}</p>
    </div>
  );
}

export function SemPermissao() {
  return (
    <Vazio
      titulo="Você não tem acesso a esta página"
      texto="Ela é restrita à coordenação do ELLP, ou o conteúdo não está vinculado ao seu cadastro."
    />
  );
}
