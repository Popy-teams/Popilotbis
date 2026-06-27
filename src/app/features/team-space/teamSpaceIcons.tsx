import type { LucideIcon } from 'lucide-react';
import {
  Rocket,
  Bug,
  Target,
  Coffee,
  Moon,
  Bot,
  Cake,
  Trophy,
  Construction,
  Clock,
  RefreshCw,
  Sparkles,
  Monitor,
  Wrench,
  Zap,
  History,
  CircleDot,
  Cookie,
  Medal,
  MessageSquareQuote,
  Dices,
  Users,
  type LucideProps,
} from 'lucide-react';
import type { TaquinMessage, WeeklyAwardType, TeamSpaceIconKey, WeeklyChallenge } from '../../types/teamSpace';

export interface IconStyle {
  icon: LucideIcon;
  color: string;
  bg: string;
  ring: string;
}

export const TEAM_SPACE_ICONS: Record<TeamSpaceIconKey, IconStyle> = {
  rocket: { icon: Rocket, color: 'text-violet-600', bg: 'bg-violet-100', ring: 'ring-violet-200' },
  bug: { icon: Bug, color: 'text-rose-600', bg: 'bg-rose-100', ring: 'ring-rose-200' },
  target: { icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-100', ring: 'ring-emerald-200' },
  coffee: { icon: Coffee, color: 'text-amber-700', bg: 'bg-amber-100', ring: 'ring-amber-200' },
  moon: { icon: Moon, color: 'text-indigo-600', bg: 'bg-indigo-100', ring: 'ring-indigo-200' },
  bot: { icon: Bot, color: 'text-sky-600', bg: 'bg-sky-100', ring: 'ring-sky-200' },
  cake: { icon: Cake, color: 'text-pink-600', bg: 'bg-pink-100', ring: 'ring-pink-200' },
  trophy: { icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-100', ring: 'ring-amber-200' },
  construction: { icon: Construction, color: 'text-orange-600', bg: 'bg-orange-100', ring: 'ring-orange-200' },
  clock: { icon: Clock, color: 'text-slate-600', bg: 'bg-slate-100', ring: 'ring-slate-200' },
  refresh: { icon: RefreshCw, color: 'text-cyan-600', bg: 'bg-cyan-100', ring: 'ring-cyan-200' },
  sparkles: { icon: Sparkles, color: 'text-fuchsia-600', bg: 'bg-fuchsia-100', ring: 'ring-fuchsia-200' },
  monitor: { icon: Monitor, color: 'text-blue-600', bg: 'bg-blue-100', ring: 'ring-blue-200' },
  wrench: { icon: Wrench, color: 'text-zinc-600', bg: 'bg-zinc-100', ring: 'ring-zinc-200' },
  zap: { icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-100', ring: 'ring-yellow-200' },
  history: { icon: History, color: 'text-purple-600', bg: 'bg-purple-100', ring: 'ring-purple-200' },
  'circle-dot': { icon: CircleDot, color: 'text-teal-600', bg: 'bg-teal-100', ring: 'ring-teal-200' },
  cookie: { icon: Cookie, color: 'text-amber-800', bg: 'bg-amber-50', ring: 'ring-amber-200' },
  medal: { icon: Medal, color: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
  quote: { icon: MessageSquareQuote, color: 'text-rose-600', bg: 'bg-rose-50', ring: 'ring-rose-200' },
  dice: { icon: Dices, color: 'text-violet-600', bg: 'bg-violet-50', ring: 'ring-violet-200' },
  users: { icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', ring: 'ring-indigo-200' },
};

export function TeamSpaceIcon({
  iconKey,
  className = 'w-5 h-5',
  ...props
}: { iconKey: TeamSpaceIconKey } & LucideProps) {
  const { icon: Icon, color } = TEAM_SPACE_ICONS[iconKey] ?? TEAM_SPACE_ICONS.bot;
  return <Icon className={`${color} ${className}`} {...props} />;
}

export function TeamSpaceIconBadge({
  iconKey,
  size = 'md',
}: {
  iconKey: TeamSpaceIconKey;
  size?: 'sm' | 'md' | 'lg';
}) {
  const { icon: Icon, bg, color, ring } = TEAM_SPACE_ICONS[iconKey] ?? TEAM_SPACE_ICONS.bot;
  const box = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';
  const icon = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl ${box} ${bg} ring-1 ${ring} shrink-0 transition-transform hover:scale-105`}
    >
      <Icon className={`${icon} ${color}`} strokeWidth={2} />
    </span>
  );
}

const AWARD_ICON: Record<WeeklyAwardType, TeamSpaceIconKey> = {
  rocket: 'rocket',
  'bug-hunter': 'bug',
  punctuality: 'target',
  'meeting-king': 'coffee',
  'night-owl': 'moon',
};

const CHALLENGE_ICON: Record<string, TeamSpaceIconKey> = {
  'ch-workspace': 'monitor',
  'ch-weird-bug': 'bug',
  'ch-fav-tool': 'wrench',
  'ch-productivity': 'zap',
  'ch-childhood': 'history',
  'ch-meeting-bingo': 'circle-dot',
  'ch-snack': 'cookie',
  'ch-win': 'medal',
};

const TAQUIN_ICON: Record<TaquinMessage['category'], TeamSpaceIconKey> = {
  task: 'construction',
  meeting: 'coffee',
  stats: 'trophy',
  fun: 'sparkles',
};

export function awardIconKey(type: WeeklyAwardType): TeamSpaceIconKey {
  return AWARD_ICON[type];
}

export function challengeIconKey(challenge: WeeklyChallenge): TeamSpaceIconKey {
  return CHALLENGE_ICON[challenge.id] ?? 'dice';
}

export function taquinIconKey(msg: TaquinMessage): TeamSpaceIconKey {
  if (msg.iconKey) return msg.iconKey;
  return TAQUIN_ICON[msg.category] ?? 'bot';
}

export function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function avatarGradient(name: string): string {
  const palettes = [
    'from-violet-500 to-indigo-600',
    'from-rose-500 to-pink-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-blue-600',
    'from-fuchsia-500 to-purple-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palettes[Math.abs(hash) % palettes.length];
}
