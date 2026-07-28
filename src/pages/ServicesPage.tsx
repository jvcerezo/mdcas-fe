import { useMemo, useState } from 'react';

import { ServiceCard } from '@/components/ServiceCard';
import {
  Container,
  EmptyState,
  ErrorState,
  LoadingState,
  Section,
  cx,
} from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';

const ALL = 'All treatments';

export function ServicesPage() {
  const [category, setCategory] = useState(ALL);
  const [clinicFilter, setClinicFilter] = useState<string | null>(null);

  const { data: clinics } = useApi((signal) => api.clinics(signal), []);
  const { data: services, loading, error, reload } = useApi(
    (signal) => api.services(clinicFilter ? { clinic: clinicFilter } : {}, signal),
    [clinicFilter],
  );

  const categories = useMemo(() => {
    if (!services) return [ALL];
    return [ALL, ...Array.from(new Set(services.map((service) => service.category)))];
  }, [services]);

  const visible = services?.filter(
    (service) => category === ALL || service.category === category,
  );

  return (
    <>
      <Section className="pb-0">
        <Container>
          <p className="eyebrow mb-4">Services</p>
          <h1 className="max-w-3xl text-4xl leading-[1.1] sm:text-5xl">
            Everything we do, with prices up front
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-500">
            Ranges reflect the usual cost of a case. Complexity varies, so the written estimate
            you get at your consultation is the one that counts — and there is never a charge
            for a treatment you have not agreed to.
          </p>
        </Container>
      </Section>

      <Section className="pt-12">
        <Container>
          <div className="space-y-5 border-b pb-6 hairline">
            <Filter
              label="Branch"
              options={[
                { value: null, label: 'All branches' },
                ...(clinics ?? []).map((clinic) => ({
                  value: clinic.slug,
                  label: clinic.shortName,
                })),
              ]}
              active={clinicFilter}
              onChange={setClinicFilter}
            />
            <Filter
              label="Category"
              options={categories.map((value) => ({ value, label: value }))}
              active={category}
              onChange={setCategory}
            />
          </div>

          {loading ? (
            <LoadingState label="Loading services" />
          ) : error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : visible && visible.length > 0 ? (
            <>
              <p className="mt-8 text-sm text-ink-400 tabular">
                {visible.length} {visible.length === 1 ? 'treatment' : 'treatments'}
              </p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((service) => (
                  <ServiceCard key={service.slug} service={service} />
                ))}
              </div>
            </>
          ) : (
            <div className="mt-10">
              <EmptyState
                title="No treatments match those filters"
                description="Try a different branch or category."
              />
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}

function Filter<T extends string | null>({
  label,
  options,
  active,
  onChange,
}: {
  label: string;
  options: Array<{ value: T; label: string }>;
  active: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 w-16 shrink-0 text-xs tracking-wide text-ink-400 uppercase">
        {label}
      </span>
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          onClick={() => onChange(option.value)}
          className={cx(
            'rounded-full border px-4 py-1.5 text-sm transition-all',
            option.value === active
              ? 'border-ink-900 bg-ink-900 text-bone-50'
              : 'border-[color-mix(in_srgb,var(--color-ink-900)_12%,transparent)] bg-white text-ink-600 hover:border-ink-400',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
