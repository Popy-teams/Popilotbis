import type { ReactNode } from 'react';
import { cn } from '../ui/utils';

export function FormActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2', className)}>
      {children}
    </div>
  );
}
