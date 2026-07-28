import { ButtonLink, Container, Section } from '@/components/ui';

export function NotFoundPage() {
  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-lg py-16 text-center">
          <p className="font-display text-6xl text-bone-400 tabular">404</p>
          <h1 className="mt-6 text-3xl">We could not find that page</h1>
          <p className="mt-4 leading-relaxed text-ink-500">
            The link may be out of date. Try the availability calendar or one of our three
            branches.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ButtonLink to="/">Back to home</ButtonLink>
            <ButtonLink to="/schedule" variant="secondary">
              Check availability
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
