import type { LucideIcon } from 'lucide-react';
import { cn } from '../ui/utils';
import { AppIcon } from './icons';
import {
  actionButtonBaseClass,
  heroButtonStyles,
  useHeroSurface,
} from './HeroSurfaceContext';

type IconButtonVariant = 'default' | 'danger' | 'primary';

const variantClass: Record<IconButtonVariant, string> = {
  default: 'hover:bg-gray-100 text-gray-700',
  danger: 'hover:bg-red-50 text-red-600',
  primary: 'hover:bg-blue-50 text-blue-600',
};

interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: IconButtonVariant;
  className?: string;
}

export function IconButton({
  icon,
  label,
  onClick,
  type = 'button',
  variant = 'default',
  className,
}: IconButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn('p-2 rounded-lg transition-colors', variantClass[variant], className)}
    >
      <AppIcon icon={icon} size="sm" />
    </button>
  );
}

interface ActionButtonProps {
  icon?: LucideIcon;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  /** Force le rendu sur bannière sombre (sinon détecté via HeroSurfaceContext) */
  onDark?: boolean;
}

const defaultActionStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
  secondary:
    'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400',
  danger:
    'border border-red-200 bg-white text-red-700 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500',
};

function getActionButtonStyles(
  variant: 'primary' | 'secondary' | 'danger',
  onDark: boolean,
  className?: string
) {
  if (onDark) {
    const hasCustomBg =
      className?.includes('bg-') &&
      !className.includes('bg-white') &&
      !className.includes('bg-white/');
    const needsWhiteText = hasCustomBg && !className?.includes('text-');
    return cn(heroButtonStyles[variant], needsWhiteText && '!text-white');
  }
  return defaultActionStyles[variant];
}

export function ActionButton({
  icon,
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className,
  onDark: onDarkProp,
}: ActionButtonProps) {
  const onDark = onDarkProp ?? useHeroSurface();

  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        actionButtonBaseClass,
        getActionButtonStyles(variant, onDark, className),
        className
      )}
    >
      {icon ? <AppIcon icon={icon} size="sm" aria-hidden /> : null}
      {children}
    </button>
  );
}

/** Bouton outline pour bannières hero (remplace les <button> bruts) */
export function HeroButton({
  children,
  variant = 'secondary',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  return (
    <button
      type="button"
      className={cn(actionButtonBaseClass, heroButtonStyles[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
