import type { ReactNode } from 'react';

type BadgeTone = 'success' | 'danger' | 'warning' | 'neutral' | 'info';

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: 'bg-status-successBg text-status-success',
  danger: 'bg-status-dangerBg text-status-danger',
  warning: 'bg-status-warningBg text-status-warning',
  neutral: 'bg-status-neutralBg text-status-neutral',
  info: 'bg-blue-50 text-blue-600',
};

interface BadgeProps {
  tone: BadgeTone;
  children: ReactNode;
}

export default function Badge({ tone, children }: BadgeProps) {
  return (
    <span className={`badge ${TONE_CLASSES[tone]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
