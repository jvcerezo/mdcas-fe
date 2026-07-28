import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';

import { Button, Card, Field, LoadingState, inputClass } from '@/components/ui';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export function StaffLoginPage() {
  const { user, initialising, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (initialising) {
    return (
      <div className="grid min-h-screen place-items-center">
        <LoadingState label="Checking your session" />
      </div>
    );
  }

  if (user) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from ?? '/staff/today'} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signIn(email, password);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? '/staff/today', { replace: true });
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : 'Could not sign you in. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-ink-900 lg:block">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(80% 90% at 25% 15%, rgb(20 120 108 / 0.4) 0%, transparent 60%)',
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-14">
          <Link to="/" className="font-display text-xl text-bone-50">
            Maralit Dental
          </Link>

          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-brand-300 uppercase">
              Staff portal
            </p>
            <h1 className="mt-6 max-w-md text-4xl leading-[1.15] text-bone-50">
              The schedule your patients see, managed here.
            </h1>
            <p className="mt-6 max-w-sm leading-relaxed text-bone-300/70">
              Every booking you record updates the public availability calendar immediately —
              with patient details kept private.
            </p>
          </div>

          <p className="text-xs text-bone-400/50">
            Authorised staff only. Access is logged.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-ink-400 transition-colors hover:text-ink-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Back to the website
          </Link>

          <div className="mt-10">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-bone-200">
              <Lock className="h-4.5 w-4.5 text-ink-600" aria-hidden />
            </span>
            <h2 className="mt-6 text-2xl">Sign in</h2>
            <p className="mt-2 text-sm text-ink-500">
              Staff accounts only. Patients do not need an account — appointments are made by
              phone.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <Field label="Work email" required>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
                placeholder="you@maralitdental.ph"
                className={inputClass}
              />
            </Field>

            <Field label="Password" required>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                className={inputClass}
              />
            </Field>

            {error ? (
              <p
                role="alert"
                className="rounded-[var(--radius-md)] border border-[var(--color-slot-full-line)] bg-[var(--color-slot-full)] px-3.5 py-2.5 text-sm text-[var(--color-slot-full-ink)]"
              >
                {error}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <Card className="mt-8 bg-bone-200/50 p-4">
            <p className="text-xs leading-relaxed text-ink-500">
              Lost access? Ask a clinic administrator to reset your password. There is no
              self-service password reset — staff accounts are created and managed internally.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
