import { StaffCard } from '@/components/StaffCard';
import {
  Container,
  ErrorState,
  LoadingState,
  Section,
  SectionHeading,
} from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';

export function AboutPage() {
  const { data: organization } = useApi((signal) => api.organization(signal), []);
  const { data: staff, loading, error, reload } = useApi((signal) => api.staff({}, signal), []);

  const clinicians = staff?.filter(
    (member) => member.role === 'Dentist' || member.role === 'Dental Hygienist',
  );
  const support = staff?.filter(
    (member) => member.role !== 'Dentist' && member.role !== 'Dental Hygienist',
  );

  return (
    <>
      <Section className="pb-0">
        <Container>
          <p className="eyebrow mb-4">About the practice</p>
          <h1 className="max-w-3xl text-4xl leading-[1.1] sm:text-5xl">
            {organization?.tagline ?? 'Three branches across Batangas. One standard of care.'}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-500">
            {organization?.description}
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionHeading eyebrow="Our approach" title="Care you can plan around" />
              <div className="mt-8 space-y-5 leading-relaxed text-ink-600">
                <p>
                  Most dental anxiety is really uncertainty — about cost, about how long it
                  will take, about whether you will be seen at all. We try to remove as much of
                  that as we can before you walk in.
                </p>
                <p>
                  Prices are published up front. Availability is on the website, updated the
                  moment the front desk books someone. Every treatment plan is written down and
                  itemised before any work starts, and nothing gets done that you have not
                  agreed to.
                </p>
                <p>
                  Your records are shared across all three branches, so being seen at Lipa one
                  month and Tanauan the next changes nothing about the care you receive.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: 'Written estimates, always',
                  body: 'You get an itemised cost before treatment begins, not a surprise at the counter.',
                },
                {
                  title: 'Shared records across branches',
                  body: 'Your history follows you between Tanauan, Lipa and Santo Tomas automatically.',
                },
                {
                  title: 'Published availability',
                  body: 'Check when a branch is free before you pick up the phone. No guessing, no wasted trips.',
                },
                {
                  title: 'Referrals stay in-house',
                  body: 'Complex surgical, implant and orthodontic work is handled by our own specialists.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[var(--radius-lg)] border bg-white p-6 hairline"
                >
                  <h3 className="text-base font-medium">{item.title}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-500">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section className="border-t bg-surface-100/40 hairline">
        <Container>
          <SectionHeading
            eyebrow="Clinicians"
            title="The people who will treat you"
            lead="Dentists and hygienists across all three branches."
          />

          {loading ? (
            <LoadingState label="Loading the team" />
          ) : error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : (
            <>
              <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {clinicians?.map((member) => (
                  <StaffCard key={member.slug} member={member} />
                ))}
              </div>

              {support && support.length > 0 ? (
                <>
                  <h3 className="mt-16 text-xs font-semibold tracking-[0.14em] text-ink-400 uppercase">
                    Support team
                  </h3>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {support.map((member) => (
                      <StaffCard key={member.slug} member={member} />
                    ))}
                  </div>
                </>
              ) : null}
            </>
          )}
        </Container>
      </Section>
    </>
  );
}
