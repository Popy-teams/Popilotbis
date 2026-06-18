import type { LucideIcon } from 'lucide-react';
import { cn } from '../ui/utils';
import { AppIcon } from './icons';

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
}

const actionVariantClass = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
  danger: 'border border-red-200 text-red-700 hover:bg-red-50',
};

export function ActionButton({
  icon,
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className,
}: ActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto',
        actionVariantClass[variant],
        className
      )}
    >
      {icon ? <AppIcon icon={icon} size="sm" /> : null}
      {children}
    </button>
  );
}
