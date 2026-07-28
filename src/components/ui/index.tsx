/**
 * Shared UI primitives.
 *
 * Deliberately small and unopinionated — the design language lives in
 * `index.css`, and these just apply it consistently.
 */

import { Link } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { ComponentProps, ElementType, ReactNode } from 'react';

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}

/* -------------------------------------------------------------------------- */
/* Layout                                                                     */
/* -------------------------------------------------------------------------- */

export function Container({
  className,
  children,
  wide = false,
}: {
  className?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={cx('mx-auto w-full px-6 sm:px-8', wide ? 'max-w-[92rem]' : 'max-w-6xl', className)}>
      {children}
    </div>
  );
}

export function Section({
  className,
  children,
  id,
}: {
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={cx('py-20 sm:py-28', className)}>
      {children}
    </section>
  );
}

/** Eyebrow + heading + optional lead, with consistent rhythm. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'left',
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div
      className={cx(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
      <h2 className="text-3xl leading-[1.15] font-normal sm:text-4xl">{title}</h2>
      {lead ? <p className="mt-5 text-lg leading-relaxed text-ink-500">{lead}</p> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Controls                                                                   */
/* -------------------------------------------------------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-ink-900 text-bone-50 hover:bg-ink-700 shadow-[var(--shadow-hair)] disabled:hover:bg-ink-900',
  secondary:
    'bg-white text-ink-800 border border-[color-mix(in_srgb,var(--color-ink-900)_12%,transparent)] hover:border-ink-400 hover:bg-bone-50',
  ghost: 'text-ink-600 hover:text-ink-900 hover:bg-bone-200',
  danger:
    'bg-white text-[var(--color-slot-full-ink)] border border-[var(--color-slot-full-line)] hover:bg-[var(--color-slot-full)]',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-[0.9375rem] gap-2',
  lg: 'h-13 px-7 text-base gap-2.5',
};

const BUTTON_BASE =
  'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 ' +
  'disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap';

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  as?: ElementType;
}

export function Button({
  variant = 'primary',
  size = 'md',
  as,
  className,
  ...rest
}: ButtonOwnProps & ComponentProps<'button'> & Record<string, unknown>) {
  const Component = (as ?? 'button') as ElementType;
  return (
    <Component
      className={cx(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className)}
      {...rest}
    />
  );
}

/** A `Button`-styled router link. */
export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  className,
  children,
}: {
  to: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className={cx(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className)}
    >
      {children}
    </Link>
  );
}

export function Card({
  className,
  children,
  hover = false,
}: {
  className?: string;
  children: ReactNode;
  hover?: boolean;
}) {
  return (
    <div
      className={cx(
        'rounded-[var(--radius-xl)] border bg-white hairline',
        hover &&
          'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cx('block', className)}>
      <span className="mb-1.5 flex items-baseline gap-1.5 text-sm font-medium text-ink-700">
        {label}
        {required ? <span className="text-[var(--color-slot-full-ink)]">*</span> : null}
        {hint ? <span className="text-xs font-normal text-ink-400">{hint}</span> : null}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-xs text-[var(--color-slot-full-ink)]">{error}</span>
      ) : null}
    </label>
  );
}

export const inputClass =
  'w-full rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--color-ink-900)_14%,transparent)] ' +
  'bg-white px-3.5 py-2.5 text-[0.9375rem] text-ink-800 placeholder:text-ink-400 ' +
  'transition-colors focus:border-brand-500 focus:outline-none';

/* -------------------------------------------------------------------------- */
/* States                                                                     */
/* -------------------------------------------------------------------------- */

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cx('animate-spin', className)} aria-hidden />;
}

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-24 text-ink-400"
      role="status"
      aria-live="polite"
    >
      <Spinner className="h-5 w-5" />
      <span className="text-sm">{label}…</span>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <AlertCircle className="h-6 w-6 text-[var(--color-slot-full-ink)]" aria-hidden />
      <p className="max-w-md text-sm text-ink-600">{message}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-xl)] border border-dashed border-bone-400 py-16 text-center">
      <p className="font-display text-lg text-ink-700">{title}</p>
      {description ? <p className="max-w-sm text-sm text-ink-500">{description}</p> : null}
      {action}
    </div>
  );
}
