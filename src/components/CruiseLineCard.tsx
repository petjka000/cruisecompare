import type { CruiseLineData } from '@/data/cruise-lines';

const PRICE_TIER_LABEL: Record<string, string> = {
  budget:  'Budget',
  mid:     'Mid-range',
  premium: 'Premium',
  luxury:  'Luxury',
};

interface Props {
  line: CruiseLineData;
}

export function CruiseLineCard({ line }: Props) {
  return (
    <a
      href={`/cruises/${line.slug}/`}
      className="block rounded-xl overflow-hidden border border-navy/10 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
    >
      {/* Accent bar with brand color */}
      <div className="h-1.5 w-full" style={{ background: line.accentColor }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-navy text-base leading-tight group-hover:text-marine transition-colors">
              {line.name}
            </h3>
            <span className="text-xs text-bluegray mt-0.5 block">
              {PRICE_TIER_LABEL[line.priceTier]} · {line.shipCount} ships
            </span>
          </div>
          <div className="text-right shrink-0 ml-3">
            <div className="text-lg font-bold" style={{ color: line.accentColor }}>
              €{line.minPricePerNight}
            </div>
            <div className="text-xs text-bluegray">per night</div>
          </div>
        </div>

        <p className="text-sm text-bluegray leading-relaxed line-clamp-2 mb-3">
          {line.description}
        </p>

        <span className="text-xs font-medium text-marine group-hover:text-coral transition-colors">
          View cruises →
        </span>
      </div>
    </a>
  );
}
