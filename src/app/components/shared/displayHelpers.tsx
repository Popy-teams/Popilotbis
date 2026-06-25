import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  Ban,
  Check,
  Circle,
  Clock,
  FlaskConical,
  Link2,
  Zap,
  AlertTriangle,
  Target,
  User,
  Users,
  FileText,
  Bot,
  BarChart3,
  Wrench,
  Calendar,
  DollarSign,
  Scale,
  Package,
  Megaphone,
  Brain,
  Mail,
  RefreshCw,
  Star,
  Video,
  Briefcase,
  Settings,
  Heart,
  TrendingUp,
  TrendingDown,
  PartyPopper,
  Hand,
  Crown,
  Lightbulb,
  GraduationCap,
  Bell,
  ClipboardList,
  BookOpen,
  X,
  ArrowRight,
} from 'lucide-react';
import { AppIcon } from './icons';
import { cn } from '../ui/utils';

export function TestModeBadge() {
  return (
    <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded font-medium inline-flex items-center gap-1.5">
      <AppIcon icon={FlaskConical} size="xs" />
      MODE TEST
    </span>
  );
}

export function TaskStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; Icon: LucideIcon }> = {
    todo: { label: 'À faire', color: 'bg-gray-100 text-gray-800 border-gray-200', Icon: Clock },
    'in-progress': { label: 'En cours', color: 'bg-blue-100 text-blue-800 border-blue-200', Icon: Zap },
    blocked: { label: 'Bloquée', color: 'bg-red-100 text-red-800 border-red-200', Icon: Ban },
    done: { label: 'Terminée', color: 'bg-green-100 text-green-800 border-green-200', Icon: Check },
  };
  const cfg = map[status] ?? { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200', Icon: Circle };
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border-2', cfg.color)}>
      <AppIcon icon={cfg.Icon} size="xs" />
      {cfg.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    high: { label: 'Haute', color: 'text-red-600', bg: 'bg-red-100', dot: 'text-red-500' },
    medium: { label: 'Moyenne', color: 'text-yellow-600', bg: 'bg-yellow-100', dot: 'text-yellow-500' },
    low: { label: 'Basse', color: 'text-green-600', bg: 'bg-green-100', dot: 'text-green-500' },
  };
  const cfg = map[priority] ?? { label: priority, color: 'text-gray-600', bg: 'bg-gray-100', dot: 'text-gray-400' };
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold', cfg.bg, cfg.color)}>
      <AppIcon icon={Circle} size="xs" className={cn('fill-current', cfg.dot)} />
      {cfg.label}
    </span>
  );
}

export function CriticalityDot({ level }: { level: 'critical' | 'high' | 'medium' | 'low' }) {
  const colors = {
    critical: 'text-red-600',
    high: 'text-orange-600',
    medium: 'text-yellow-600',
    low: 'text-green-600',
  };
  return <AppIcon icon={Circle} size="xs" className={cn('fill-current', colors[level])} />;
}

export const categoryIcons: Record<string, LucideIcon> = {
  technical: Wrench,
  quality: Check,
  planning: Calendar,
  financial: DollarSign,
  hr: Users,
  legal: Scale,
  'supply-chain': Package,
  marketing: Megaphone,
};

export function IconLabel({
  icon,
  children,
  className = '',
  iconSize = 'sm',
}: {
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
  iconSize?: 'xs' | 'sm' | 'md';
}) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <AppIcon icon={icon} size={iconSize} />
      {children}
    </span>
  );
}

export {
  Ban,
  Check,
  Circle,
  Clock,
  FlaskConical,
  Link2,
  Zap,
  AlertTriangle,
  Target,
  User,
  Users,
  FileText,
  Bot,
  BarChart3,
  Wrench,
  Calendar,
  DollarSign,
  Scale,
  Package,
  Megaphone,
  Brain,
  Mail,
  RefreshCw,
  Star,
  Video,
  Briefcase,
  Settings,
  Heart,
  TrendingUp,
  TrendingDown,
  PartyPopper,
  Hand,
  Crown,
  Lightbulb,
  GraduationCap,
  Bell,
  ClipboardList,
  BookOpen,
  X,
  ArrowRight,
};
