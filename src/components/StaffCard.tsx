import { Card, cx } from '@/components/ui';
import type { StaffMember } from '@/types';

/** Initials stand in for a photo until real headshots exist. */
function initials(name: string): string {
  return name
    .replace(/^(Dr|Ms|Mr|Mrs)\.?\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function StaffCard({
  member,
  className,
}: {
  member: StaffMember;
  className?: string;
}) {
  return (
    <Card hover className={cx('flex h-full flex-col p-6', className)}>
      <div className="flex items-center gap-4">
        {member.photo ? (
          <img
            src={member.photo}
            alt=""
            className="h-14 w-14 rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <span
            aria-hidden
            className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-bone-200 font-display text-base text-ink-500"
          >
            {initials(member.name)}
          </span>
        )}

        <div className="min-w-0">
          <h3 className="truncate text-base leading-snug font-medium text-ink-900">
            {member.name}
          </h3>
          {member.credentials ? (
            <p className="mt-0.5 text-xs text-ink-400">{member.credentials}</p>
          ) : null}
        </div>
      </div>

      <p className="mt-5 text-sm font-medium text-brand-700">{member.specialty}</p>
      <p className="mt-2.5 flex-1 text-[0.9375rem] leading-relaxed text-ink-500">{member.bio}</p>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t pt-4 text-xs text-ink-400 hairline">
        <span className="tabular">{member.yearsExperience} years experience</span>
        {member.languages.length > 0 ? <span>{member.languages.join(' · ')}</span> : null}
      </div>
    </Card>
  );
}
