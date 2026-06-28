import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  FileText,
  DollarSign,
  Shield,
  User,
  Rocket,
  Package,
  BookOpen,
  Calendar,
  Eye,
  TrendingUp,
  Smile,
  Award,
  BarChart3,
  PartyPopper,
  RefreshCw,
} from 'lucide-react';

export type ViewType =
  | 'my-dashboard'
  | 'dashboard'
  | 'projects'
  | 'tasks'
  | 'team'
  | 'team-space'
  | 'budget'
  | 'meetings'
  | 'process'
  | 'pipeline'
  | 'documentation'
  | 'risks'
  | 'calendar'
  | 'veille'
  | 'marketing'
  | 'satisfaction'
  | 'audit'
  | 'kpi'
  | 'pdca';

export type NavSection = 'personal' | 'management' | 'quality';

export interface AppRouteConfig {
  id: ViewType;
  path: string;
  label: string;
  icon: LucideIcon;
  section: NavSection;
}

/** Routes applicatives (chemins relatifs au layout authentifié). */
export const APP_ROUTES: AppRouteConfig[] = [
  { id: 'my-dashboard', path: 'mon-tableau-de-bord', label: 'Mon tableau de bord', icon: User, section: 'personal' },
  { id: 'dashboard', path: 'vue-ensemble', label: "Vue d'ensemble", icon: LayoutDashboard, section: 'management' },
  { id: 'projects', path: 'portfolio-projets', label: 'Portfolio projets', icon: FolderKanban, section: 'management' },
  { id: 'process', path: 'processus', label: 'Approche processus', icon: Rocket, section: 'management' },
  { id: 'pipeline', path: 'pipeline', label: 'Pipeline & Étapes', icon: Package, section: 'management' },
  { id: 'tasks', path: 'taches', label: 'Tâches', icon: CheckSquare, section: 'management' },
  { id: 'team', path: 'equipe', label: 'Équipe', icon: Users, section: 'management' },
  { id: 'team-space', path: 'espace-equipe', label: 'Espace Équipe', icon: PartyPopper, section: 'management' },
  { id: 'meetings', path: 'reunions', label: 'Réunions & CR', icon: FileText, section: 'management' },
  { id: 'calendar', path: 'planning', label: 'Planning', icon: Calendar, section: 'management' },
  { id: 'budget', path: 'budget', label: 'Budget', icon: DollarSign, section: 'management' },
  { id: 'risks', path: 'risques', label: 'Risques', icon: Shield, section: 'management' },
  { id: 'veille', path: 'veille', label: 'Veille ISO', icon: Eye, section: 'quality' },
  { id: 'marketing', path: 'marketing', label: 'Stratégie Marketing', icon: TrendingUp, section: 'quality' },
  { id: 'satisfaction', path: 'satisfaction', label: 'Satisfaction Client', icon: Smile, section: 'quality' },
  { id: 'audit', path: 'audit', label: 'Audit ISO 9001', icon: Award, section: 'quality' },
  { id: 'kpi', path: 'kpi', label: 'KPI & Performance', icon: BarChart3, section: 'quality' },
  { id: 'pdca', path: 'pdca', label: 'PDCA', icon: RefreshCw, section: 'quality' },
  { id: 'documentation', path: 'documentation', label: 'Documentation', icon: BookOpen, section: 'quality' },
];

export const DEFAULT_VIEW: ViewType = 'my-dashboard';

export const LOGIN_PATH = '/connexion';

export function getRoutePath(view: ViewType): string {
  return APP_ROUTES.find((r) => r.id === view)?.path ?? APP_ROUTES[0].path;
}

export function getViewFromPathname(pathname: string): ViewType | null {
  const segment = pathname.replace(/^\/+|\/+$/g, '').split('/')[0] ?? '';
  if (!segment) return DEFAULT_VIEW;
  const match = APP_ROUTES.find((r) => r.path === segment);
  return match?.id ?? null;
}

export function isAppRoutePath(pathname: string): boolean {
  const segment = pathname.replace(/^\/+|\/+$/g, '').split('/')[0] ?? '';
  if (!segment) return true;
  return APP_ROUTES.some((r) => r.path === segment);
}
