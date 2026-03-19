import type { DestinationData } from '@/data/destinations';

interface Props {
  destination: DestinationData;
}

export function DestinationCard({ destination }: Props) {
  const { name, slug, gradient, cruiseCount, fromPrice, tagline } = destination;

  return (
    <a
      href={`/destinations/${slug}/`}
      className="block rounded-xl overflow-hidden relative h-44 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group"
      style={{ background: gradient }}
    >
      {/* Subtle pattern overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 70% 30%, rgba(255,255,255,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-5">
        <div>
          <h3 className="text-xl font-bold text-white leading-tight"
            style={{ fontFamily: 'var(--font-dm-serif, serif)' }}>
            {name}
          </h3>
          <p className="text-white/70 text-xs mt-1 leading-relaxed line-clamp-2">{tagline}</p>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-white/60 text-xs">{cruiseCount} cruises available</div>
            <div className="text-white font-semibold text-sm">From €{fromPrice}</div>
          </div>
          <span className="text-white/70 text-xs group-hover:text-white transition-colors font-medium">
            Explore →
          </span>
        </div>
      </div>
    </a>
  );
}
