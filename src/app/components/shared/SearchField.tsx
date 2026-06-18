import type { LucideIcon } from 'lucide-react';
import { Search } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../ui/utils';
import { AppIcon } from './icons';

export interface SearchFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  wrapperClassName?: string;
}

export function SearchField({
  icon = Search,
  className,
  wrapperClassName,
  ...props
}: SearchFieldProps) {
  return (
    <div className={cn('search-field-wrap', wrapperClassName)}>
      <AppIcon icon={icon} size="sm" className="search-field-icon" />
      <input type="search" className={cn('search-field', className)} {...props} />
    </div>
  );
}
