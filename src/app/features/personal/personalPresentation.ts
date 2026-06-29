import type { AuthUser } from '../../auth/authApi';
import type { PersonalProfile } from '../../types/personal';
import {
  computeProfileCompletion,
  getDisplayName,
  getRoleLabel,
} from '../../data/personalProfileStore';

export type { PersonalTab } from '../../types/personal';

export interface PersonalStats {
  completion: number;
  displayName: string;
  roleLabel: string;
  memberSince: string;
  emailVerified: boolean;
}

export function buildPersonalStats(user: AuthUser, profile: PersonalProfile): PersonalStats {
  return {
    completion: computeProfileCompletion(profile),
    displayName: getDisplayName(profile) || user.name,
    roleLabel: getRoleLabel(user.role),
    memberSince: new Date(user.createdAt).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    }),
    emailVerified: user.emailVerified,
  };
}
