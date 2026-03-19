export interface ComparisonCardProps {
  slug: string;
  lineAName: string;
  lineBName: string;
  title: string;
  excerpt: string;
  priceA?: number;
  priceB?: number;
}

export function ComparisonCard({
  slug, lineAName, lineBName, title, excerpt, priceA, priceB,
}: ComparisonCardProps) {
  return (
    <a
      href={`/compare/${slug}/`}
      className="block rounded-xl border border-navy/10 bg-white p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
    >
      {/* VS badge */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-sm font-semibold text-navy/80 leading-tight">{lineAName}</span>
        <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-navy text-white">VS</span>
        <span className="text-sm font-semibold text-navy/80 leading-tight">{lineBName}</span>
      </div>

      {/* Prices */}
      {(priceA || priceB) && (
        <div className="flex gap-4 mb-3">
          {priceA && (
            <div className="text-center">
              <div className="text-lg font-bold text-marine">€{priceA}</div>
              <div className="text-xs text-bluegray">7-night avg</div>
            </div>
          )}
          {priceA && priceB && <div className="text-bluegray/40 self-center text-xl">·</div>}
          {priceB && (
            <div className="text-center">
              <div className="text-lg font-bold text-marine">€{priceB}</div>
              <div className="text-xs text-bluegray">7-night avg</div>
            </div>
          )}
        </div>
      )}

      <p className="text-sm text-bluegray leading-relaxed line-clamp-3 mb-3">{excerpt}</p>

      <span className="text-xs font-medium text-marine group-hover:text-coral transition-colors">
        Read comparison →
      </span>
    </a>
  );
}
