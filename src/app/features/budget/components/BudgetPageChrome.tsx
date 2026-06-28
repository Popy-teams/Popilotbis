import type { ReactNode } from 'react';
import {
  BudgetBreadcrumbs,
  budgetInputClass,
  budgetLabelClass,
  type BudgetAccent,
  accentClass,
} from './BudgetUIKit';

interface Crumb {
  label: string;
  onClick?: () => void;
}

interface BudgetPageChromeProps {
  crumbs: Crumb[];
  title: string;
  subtitle?: string;
  /** @deprecated Utiliser accent */
  gradient?: string;
  accent?: BudgetAccent;
  badge?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  maxWidth?: 'md' | 'lg' | 'xl';
}

const maxW = { md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-5xl' };

export function BudgetPageChrome({
  crumbs,
  title,
  subtitle,
  accent = 'bom',
  badge,
  actions,
  children,
  maxWidth = 'lg',
}: BudgetPageChromeProps) {
  return (
    <div className={`budget-page ${maxW[maxWidth]} mx-auto w-full px-0 sm:px-1 space-y-4 pb-8`}>
      <BudgetBreadcrumbs crumbs={crumbs} />

      <header className={`budget-page-header ${accentClass[accent]}`}>
        <div className="budget-page-header__content">
          <div className="budget-page-header__text min-w-0">
            {badge && <div className="budget-page-header__badge">{badge}</div>}
            <h1 className="budget-page-title">{title}</h1>
            {subtitle && <p className="budget-page-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="budget-page-header__actions">{actions}</div>}
        </div>
      </header>

      <div className="budget-page-body space-y-4">{children}</div>
    </div>
  );
}

export function BudgetFormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="budget-section">
      <div className="budget-section__head">
        <h2 className="budget-section__title">{title}</h2>
        {description && <p className="budget-section__desc">{description}</p>}
      </div>
      <div className="budget-section__body">{children}</div>
    </section>
  );
}

export function BudgetDetailGrid({ children }: { children: ReactNode }) {
  return <dl className="budget-detail-grid">{children}</dl>;
}

export function BudgetDetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="budget-detail-field">
      <dt className="budget-detail-field__label">{label}</dt>
      <dd className="budget-detail-field__value">{children}</dd>
    </div>
  );
}

export function BudgetHighlightBox({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="budget-highlight-box">
      <span className="budget-highlight-box__label">{label}</span>
      <span className="budget-highlight-box__value">{value}</span>
      {hint && <span className="budget-highlight-box__hint">{hint}</span>}
    </div>
  );
}

export { budgetInputClass, budgetLabelClass };
