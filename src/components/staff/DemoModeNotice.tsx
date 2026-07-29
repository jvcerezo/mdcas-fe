/**
 * Shown in the staff portal whenever the app is running without a backend.
 *
 * This is not decoration. Staff will otherwise reasonably assume a booking
 * they record is visible to colleagues and to patients checking the public
 * calendar — and in standalone mode it is not. Saying so at the point of use
 * is the only thing preventing a real scheduling mistake.
 */

import { useState } from 'react';
import { RotateCcw, TriangleAlert, X } from 'lucide-react';

import { Container } from '@/components/ui';
import { STANDALONE } from '@/lib/api';
import { resetDemoData } from '@/lib/localStore';

export function DemoModeNotice() {
  const [dismissed, setDismissed] = useState(false);
  if (!STANDALONE || dismissed) return null;

  const handleReset = () => {
    if (
      !window.confirm(
        'Delete every booking stored in this browser and regenerate the demo set?',
      )
    ) {
      return;
    }
    resetDemoData();
    window.location.reload();
  };

  return (
    <div className="border-b border-[var(--color-slot-filling-line)] bg-[var(--color-slot-filling)]">
      <Container wide>
        <div className="flex items-start gap-3 py-2.5 text-[var(--color-slot-filling-ink)]">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p className="flex-1 text-xs leading-relaxed">
            <span className="font-semibold">Demo mode — no backend connected.</span>{' '}
            Bookings are saved in this browser only. Colleagues on other devices and patients
            checking the public calendar will not see them, and clearing site data erases
            everything. Do not use this for real patient records.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--color-slot-filling-line)] bg-white/60 px-2.5 py-1 text-[0.6875rem] font-medium transition-colors hover:bg-white"
          >
            <RotateCcw className="h-3 w-3" aria-hidden />
            Reset demo data
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className="shrink-0 rounded-full p-1 transition-colors hover:bg-white/60"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </Container>
    </div>
  );
}
