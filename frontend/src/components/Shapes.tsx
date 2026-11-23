// Formas geométricas soltas, no espírito dos ícones flutuantes do site do ELLP.
export function Shapes({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 600 700" fill="none">
      <rect className="drift" x="70" y="90" width="64" height="64" rx="10" fill="#FF8A1F" />
      <circle className="drift-slow" cx="470" cy="150" r="38" fill="#4F86F5" />
      <path className="drift" d="M420 380l54 54m0-54l-54 54" stroke="#FFA03A" strokeWidth="14" strokeLinecap="round" />
      <rect className="drift-slow" x="120" y="470" width="44" height="44" rx="8" fill="#86B0FF" transform="rotate(18 142 492)" />
      <circle className="drift" cx="500" cy="590" r="22" fill="#FF8A1F" />
      <path className="drift-slow" d="M250 60l30 52h-60z" fill="#2A63DB" />
      <rect className="drift" x="330" y="560" width="30" height="30" rx="6" fill="#FFD3A1" />
    </svg>
  );
}
