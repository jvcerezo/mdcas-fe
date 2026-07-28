import { Clock } from 'lucide-react';

import { Card } from '@/components/ui';
import { formatDuration, formatPriceRange } from '@/lib/format';
import type { Service } from '@/types';

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Card hover className="flex h-full flex-col p-6">
      <p className="text-[0.6875rem] font-semibold tracking-[0.12em] text-ink-400 uppercase">
        {service.category}
      </p>

      <h3 className="mt-3 text-lg leading-snug">{service.name}</h3>

      <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink-500">
        {service.summary}
      </p>

      <div className="mt-6 flex items-end justify-between gap-4 border-t pt-5 hairline">
        <div>
          <p className="text-[0.6875rem] tracking-wide text-ink-400 uppercase">From</p>
          <p className="mt-1 font-display text-lg text-ink-900 tabular">
            {formatPriceRange(service.priceMin, service.priceMax)}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-400">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          <span className="tabular">{formatDuration(service.durationMinutes)}</span>
        </span>
      </div>
    </Card>
  );
}
