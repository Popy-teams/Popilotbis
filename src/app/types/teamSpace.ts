export type TeamSpaceIconKey =
  | 'rocket'
  | 'bug'
  | 'target'
  | 'coffee'
  | 'moon'
  | 'bot'
  | 'cake'
  | 'trophy'
  | 'construction'
  | 'clock'
  | 'refresh'
  | 'sparkles'
  | 'monitor'
  | 'wrench'
  | 'zap'
  | 'history'
  | 'circle-dot'
  | 'cookie'
  | 'medal'
  | 'quote'
  | 'dice'
  | 'users';

export type WeeklyAwardType =
  | 'rocket'
  | 'bug-hunter'
  | 'punctuality'
  | 'meeting-king'
  | 'night-owl';

export interface WeeklyAward {
  type: WeeklyAwardType;
  memberId: string;
  memberName: string;
  value: number;
  label: string;
  weekKey: string;
}

export interface TeamQuote {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  context?: string;
  createdAt: string;
  votes: string[];
}

export interface ChallengeResponse {
  id: string;
  challengeId: string;
  weekKey: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  likes: string[];
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  iconKey: TeamSpaceIconKey;
  prompt: string;
}

export interface MemberPoints {
  memberId: string;
  memberName: string;
  total: number;
  monthly: number;
  monthKey: string;
  history: { reason: string; points: number; at: string }[];
}

export interface TaquinMessage {
  id: string;
  text: string;
  category: 'task' | 'meeting' | 'stats' | 'fun';
  iconKey: TeamSpaceIconKey;
}

export const AWARD_META: Record<
  WeeklyAwardType,
  { title: string; description: string }
> = {
  rocket: {
    title: 'Fusée de la semaine',
    description: 'Plus grand nombre de tâches terminées',
  },
  'bug-hunter': {
    title: 'Chasseur de bugs',
    description: 'Plus grand nombre d’anomalies résolues',
  },
  punctuality: {
    title: 'Maître de la ponctualité',
    description: 'Meilleure tenue des délais',
  },
  'meeting-king': {
    title: 'Roi / Reine des réunions',
    description: 'Plus forte participation aux réunions',
  },
  'night-owl': {
    title: 'Couche-tard',
    description: 'Dernière activité enregistrée de la semaine',
  },
};

export const POINTS_RULES = {
  challengeParticipation: 50,
  quotePublished: 20,
  voteReceived: 5,
  weeklyAward: 100,
  quoteVote: 2,
} as const;
