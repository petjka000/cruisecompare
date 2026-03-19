const DEST_GRADIENTS: Record<string, string> = {
  mediterranean:     'linear-gradient(135deg, #2E86C1 0%, #0A1B3D 100%)',
  caribbean:         'linear-gradient(135deg, #1A8A7D 0%, #0A4F44 100%)',
  alaska:            'linear-gradient(135deg, #5DADE2 0%, #1B4F72 100%)',
  'northern europe': 'linear-gradient(135deg, #34698A 0%, #0A1B3D 100%)',
  'canary islands':  'linear-gradient(135deg, #D4A853 0%, #8B6914 100%)',
  adriatic:          'linear-gradient(135deg, #2E86C1 0%, #1A8A7D 100%)',
  'south pacific':   'linear-gradient(135deg, #48D1CC 0%, #1A6B5F 100%)',
  asia:              'linear-gradient(135deg, #D4A853 0%, #8B6914 100%)',
  'greek isles':     'linear-gradient(135deg, #2980B9 0%, #1B3A6B 100%)',
  norway:            'linear-gradient(135deg, #4A90D9 0%, #0A2B4F 100%)',
  baltic:            'linear-gradient(135deg, #2C5F8A 0%, #0A1B3D 100%)',
};

function destGradient(destination: string): string {
  const key = destination.toLowerCase();
  return DEST_GRADIENTS[key] ?? 'linear-gradient(135deg, #1B6FA8 0%, #0A1B3D 100%)';
}

export interface DealCardProps {
  slug: string;
  title: string;
  cruise_line: string;
  destination: string;
  departure_port: string;
  duration_nights: number;
  price_eur: number;
  original_price_eur?: number;
  discount_pct?: number;
  excerpt?: string;
  isPlaceholder?: boolean;
}

export function DealCard(props: DealCardProps) {
  const {
    slug, title, cruise_line, destination, departure_port,
    duration_nights, price_eur, original_price_eur, discount_pct, excerpt, isPlaceholder,
  } = props;

  const discount = discount_pct
    ? discount_pct
    : original_price_eur
    ? Math.round(((original_price_eur - price_eur) / original_price_eur) * 100)
    : null;

  const href = isPlaceholder ? '/deals/' : `/deals/${slug}/`;

  return (
    <a
      href={href}
      className="block rounded-xl overflow-hidden border border-navy/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 bg-white group"
    >
      {/* Gradient header (replaces photo) */}
      <div
        className="h-28 relative flex items-end p-4"
        style={{ background: destGradient(destination) }}
      >
        {discount !== null && discount > 0 && (
          <span className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full text-white"
            style={{ background: '#e8593c' }}>
            -{discount}%
          </span>
        )}
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold text-white leading-none">€{price_eur}</span>
          {original_price_eur && (
            <span className="text-sm text-white/60 line-through">€{original_price_eur}</span>
          )}
        </div>
        <span className="ml-auto text-white/70 text-xs">per person</span>
      </div>

      {/* Card body */}
      <div className="p-4">
        {/* Cruise line + destination chips */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-navy/8 text-navy">
            {cruise_line}
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-marine/8 text-marine">
            {destination}
          </span>
        </div>

        <h3 className="font-semibold text-navy leading-snug mb-1.5 group-hover:text-marine transition-colors line-clamp-2">
          {title}
        </h3>

        {excerpt && (
          <p className="text-sm text-bluegray leading-relaxed mb-3 line-clamp-2">{excerpt}</p>
        )}

        <div className="flex items-center justify-between text-xs text-bluegray border-t border-navy/8 pt-3 mt-auto">
          <span>{duration_nights} nights · {departure_port}</span>
          <span className="font-medium text-marine group-hover:text-coral transition-colors">
            View deal →
          </span>
        </div>
      </div>
    </a>
  );
}
