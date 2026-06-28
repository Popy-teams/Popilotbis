import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { ChevronRight, Eye } from 'lucide-react';

/** Accents discrets par section budget */
export type BudgetAccent = 'bom' | 'quote' | 'supplier' | 'funding';

const accentClass: Record<BudgetAccent, string> = {
  bom: 'budget-accent--bom',
  quote: 'budget-accent--quote',
  supplier: 'budget-accent--supplier',
  funding: 'budget-accent--funding',
};

/* ——— Typographie & champs ——— */

export const budgetInputClass =
  'budget-field w-full min-w-0 px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition';
export const budgetLabelClass = 'budget-label block text-xs font-semibold text-slate-600 mb-1.5';

/* ——— Badge & tags ——— */

export function BudgetBadge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`budget-badge ${className}`}>{children}</span>;
}

export function BudgetTag({ children }: { children: ReactNode }) {
  return <span className="budget-tag">{children}</span>;
}

export function BudgetTagList({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-1.5">{children}</div>;
}

/* ——— Montants ——— */

export function BudgetMoney({
  amount,
  suffix = '€',
  size = 'md',
  tone = 'default',
}: {
  amount: number | string;
  suffix?: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'default' | 'muted' | 'accent';
}) {
  const value = typeof amount === 'number' ? amount.toFixed(2) : amount;
  return (
    <span className={`budget-money budget-money--${size} budget-money--${tone}`} data-suffix={suffix}>
      {value}
      {suffix ? ` ${suffix}` : ''}
    </span>
  );
}

/* ——— Carte liste (BOM, devis, fournisseurs, financement) ——— */

interface BudgetListCardProps {
  onClick?: () => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  as?: 'button' | 'article';
}

export function BudgetListCard({ onClick, children, footer, className = '', as }: BudgetListCardProps) {
  const Tag = as ?? (onClick ? 'button' : 'article');
  const shared = `budget-list-card ${className}`;

  if (Tag === 'button') {
    return (
      <button type="button" onClick={onClick} className={`${shared} budget-list-card--interactive`}>
        <div className="budget-list-card__body">{children}</div>
        {footer ?? (onClick ? <BudgetCardFooter /> : null)}
      </button>
    );
  }

  return (
    <article className={shared}>
      <div className="budget-list-card__body">{children}</div>
      {footer}
    </article>
  );
}

export function BudgetCardHeader({
  title,
  subtitle,
  badge,
  trailing,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div className="budget-card-header">
      <div className="budget-card-header__main min-w-0">
        <div className="budget-card-header__title-row">
          <h3 className="budget-card-title">{title}</h3>
          {badge}
        </div>
        {subtitle && <p className="budget-card-subtitle">{subtitle}</p>}
      </div>
      {trailing && <div className="budget-card-header__trailing shrink-0">{trailing}</div>}
    </div>
  );
}

export function BudgetCardFooter({ label = 'Voir le détail' }: { label?: string }) {
  return (
    <div className="budget-list-card__footer">
      <span className="budget-card-link">
        <Eye className="w-3.5 h-3.5" aria-hidden />
        {label}
      </span>
    </div>
  );
}

export function BudgetCardMeta({
  icon: Icon,
  children,
}: {
  icon?: LucideIcon;
  children: ReactNode;
}) {
  return (
    <p className="budget-card-meta">
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />}
      <span>{children}</span>
    </p>
  );
}

export function BudgetCardActions({
  onView,
  onEdit,
  viewLabel = 'Détails',
  editLabel = 'Modifier',
}: {
  onView: () => void;
  onEdit: () => void;
  viewLabel?: string;
  editLabel?: string;
}) {
  return (
    <div className="budget-card-actions">
      <button type="button" onClick={onView} className="budget-card-actions__btn budget-card-actions__btn--ghost">
        {viewLabel}
      </button>
      <button type="button" onClick={onEdit} className="budget-card-actions__btn budget-card-actions__btn--primary">
        {editLabel}
      </button>
    </div>
  );
}

/* ——— Barre d'outils panneau ——— */

export function BudgetPanelToolbar({
  countLabel,
  actionLabel,
  onAction,
  icon: Icon,
}: {
  countLabel: string;
  actionLabel: string;
  onAction: () => void;
  icon?: LucideIcon;
}) {
  return (
    <div className="budget-panel-toolbar">
      <p className="budget-panel-toolbar__count">{countLabel}</p>
      <button type="button" onClick={onAction} className="budget-btn budget-btn--primary">
        {Icon && <Icon className="w-4 h-4" aria-hidden />}
        {actionLabel}
      </button>
    </div>
  );
}

/* ——— KPI discrets ——— */

export function BudgetKpiGrid({ children }: { children: ReactNode }) {
  return <div className="budget-kpi-grid">{children}</div>;
}

export function BudgetKpiCard({
  label,
  value,
  accent = 'bom',
}: {
  label: string;
  value: ReactNode;
  accent?: BudgetAccent;
}) {
  return (
    <div className={`budget-kpi-card ${accentClass[accent]}`}>
      <span className="budget-kpi-card__label">{label}</span>
      <span className="budget-kpi-card__value">{value}</span>
    </div>
  );
}

/* ——— Boutons formulaire ——— */

export function BudgetFormActions({
  onCancel,
  submitLabel,
  cancelLabel = 'Annuler',
}: {
  onCancel: () => void;
  submitLabel: string;
  cancelLabel?: string;
}) {
  return (
    <div className="budget-form-actions">
      <button type="button" onClick={onCancel} className="budget-btn budget-btn--ghost budget-btn--block">
        {cancelLabel}
      </button>
      <button type="submit" className="budget-btn budget-btn--primary budget-btn--block">
        {submitLabel}
      </button>
    </div>
  );
}

export function BudgetPageActions({ children }: { children: ReactNode }) {
  return <div className="budget-page-actions">{children}</div>;
}

export function BudgetPageAction({
  onClick,
  children,
  variant = 'ghost',
}: {
  onClick: () => void;
  children: ReactNode;
  variant?: 'ghost' | 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`budget-btn budget-btn--sm ${variant === 'danger' ? 'budget-btn--danger' : 'budget-btn--ghost-on-dark'}`}
    >
      {children}
    </button>
  );
}

/* ——— Fil d'Ariane ——— */

export function BudgetBreadcrumbs({ crumbs }: { crumbs: { label: string; onClick?: () => void }[] }) {
  return (
    <nav className="budget-breadcrumbs" aria-label="Fil d'Ariane">
      {crumbs.map((c, i) => (
        <span key={i} className="budget-breadcrumbs__item">
          {i > 0 && <ChevronRight className="w-3 h-3 shrink-0 text-slate-300" aria-hidden />}
          {c.onClick ? (
            <button type="button" onClick={c.onClick} className="budget-breadcrumbs__link">
              {c.label}
            </button>
          ) : (
            <span className="budget-breadcrumbs__current">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export { accentClass };
