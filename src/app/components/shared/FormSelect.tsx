import type { LucideIcon } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import type { ReactNode, SelectHTMLAttributes } from 'react';
import { cn } from '../ui/utils';
import { AppIcon } from './icons';

type FormSelectSize = 'sm' | 'md';

export interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  leadingIcon?: LucideIcon;
  /** Icône dynamique (ex. catégorie) — rendue dans le même slot que leadingIcon */
  leadingIconElement?: ReactNode;
  size?: FormSelectSize;
  wrapperClassName?: string;
}

export function FormSelect({
  leadingIcon,
  leadingIconElement,
  size = 'md',
  className,
  wrapperClassName,
  children,
  ...props
}: FormSelectProps) {
  const hasLeading = Boolean(leadingIcon || leadingIconElement);

  return (
    <div className={cn('form-select-wrap', wrapperClassName)}>
      {leadingIcon ? (
        <AppIcon icon={leadingIcon} size="sm" className="form-select-icon" />
      ) : leadingIconElement ? (
        <span className="form-select-icon flex items-center justify-center">{leadingIconElement}</span>
      ) : null}
      <select
        className={cn(
          'form-select',
          hasLeading && 'form-select-with-icon',
          size === 'sm' && 'form-select-sm',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="form-select-chevron" aria-hidden />
    </div>
  );
}
