import type { LucideIcon } from 'lucide-react';
import { cn } from '../ui/utils';

/** Tailles d'icones standardisees dans toute l'application */
export const iconSizeClass = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
} as const;

export type IconSize = keyof typeof iconSizeClass;

interface AppIconProps {
  icon: LucideIcon;
  size?: IconSize;
  className?: string;
}

export function AppIcon({ icon: Icon, size = 'sm', className }: AppIconProps) {
  return <Icon className={cn(iconSizeClass[size], 'shrink-0', className)} aria-hidden />;
}

/** Icône dans une carte stat (taille fixe 40×40, icône md au centre) */
interface StatIconProps {
  icon: LucideIcon;
  className?: string;
}

export function StatIcon({ icon: Icon, className }: StatIconProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-10 h-10 rounded-lg shrink-0',
        className
      )}
      aria-hidden
    >
      <Icon className={iconSizeClass.md} />
    </span>
  );
}
