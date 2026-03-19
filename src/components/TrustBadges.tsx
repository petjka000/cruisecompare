interface Badge {
  label: string;
}

interface Props {
  badges: Badge[];
}

export function TrustBadges({ badges }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6">
      {badges.map(({ label }, i) => (
        <span key={i} className="flex items-center gap-1.5 text-sm text-white/80">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="6" stroke="#5DADE2" strokeWidth="1.5"/>
            <path d="M4 7l2 2 4-4" stroke="#5DADE2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {label}
        </span>
      ))}
    </div>
  );
}
