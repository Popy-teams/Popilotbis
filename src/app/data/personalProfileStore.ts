import type { AuthUser } from '../auth/authApi';
import { resolveMemberIdForUser } from './projectMembers';
import { findTeamMember, loadTeamMembers } from '../utils/teamMemberStore';
import type { PersonalProfile, NotificationPreferences } from '../types/personal';

const STORAGE_KEY = 'popilot:personal-profile-v1';

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  emailTasks: true,
  emailMeetings: true,
  emailMentions: true,
  weeklyDigest: false,
  pushEnabled: true,
};

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return { firstName: parts[0] ?? '', lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

export function getDisplayName(profile: Pick<PersonalProfile, 'firstName' | 'lastName'>): string {
  return [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
}

export function getInitials(profile: Pick<PersonalProfile, 'firstName' | 'lastName'>): string {
  const first = profile.firstName.trim()[0] ?? '';
  const last = profile.lastName.trim()[0] ?? '';
  return (first + last).toUpperCase() || '??';
}

export function getRoleLabel(role: AuthUser['role']): string {
  switch (role) {
    case 'admin':
      return 'Administrateur';
    case 'manager':
      return 'Manager';
    default:
      return 'Membre';
  }
}

export function buildDefaultProfile(user: AuthUser): PersonalProfile {
  const memberId = resolveMemberIdForUser(user);
  const teamMember = findTeamMember(memberId, loadTeamMembers());
  const { firstName, lastName } = splitName(user.name);

  return {
    userId: user.id,
    firstName: teamMember?.name.split(' ')[0] ?? firstName,
    lastName: teamMember?.name.split(' ').slice(1).join(' ') || lastName,
    jobTitle: teamMember?.role ?? getRoleLabel(user.role),
    department: teamMember?.category ?? 'Direction & Coordination',
    phone: teamMember?.phone ?? '',
    mobile: '',
    office: 'Paris — Siège',
    bio: '',
    timezone: 'Europe/Paris',
    language: 'fr',
    linkedIn: '',
    avatarUrl: teamMember?.photoUrl ?? '',
    notifications: { ...DEFAULT_NOTIFICATIONS },
    updatedAt: new Date().toISOString(),
  };
}

function normalizeProfile(raw: Partial<PersonalProfile>, user: AuthUser): PersonalProfile {
  const base = buildDefaultProfile(user);
  return {
    ...base,
    ...raw,
    userId: user.id,
    notifications: { ...DEFAULT_NOTIFICATIONS, ...raw.notifications },
    updatedAt: raw.updatedAt ?? base.updatedAt,
  };
}

export function loadPersonalProfile(user: AuthUser): PersonalProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const all = JSON.parse(raw) as Record<string, Partial<PersonalProfile>>;
      const saved = all[user.id];
      if (saved) return normalizeProfile(saved, user);
    }
  } catch {
    /* ignore */
  }
  return buildDefaultProfile(user);
}

export function savePersonalProfile(profile: PersonalProfile): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: Record<string, PersonalProfile> = raw ? JSON.parse(raw) : {};
    all[profile.userId] = { ...profile, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function computeProfileCompletion(profile: PersonalProfile): number {
  const fields = [
    profile.firstName,
    profile.lastName,
    profile.jobTitle,
    profile.department,
    profile.phone || profile.mobile,
    profile.office,
    profile.bio,
  ];
  const filled = fields.filter((f) => f.trim().length > 0).length;
  return Math.round((filled / fields.length) * 100);
}

export const TIMEZONE_OPTIONS = [
  { value: 'Europe/Paris', label: 'Paris (UTC+1/+2)' },
  { value: 'Europe/London', label: 'Londres (UTC+0/+1)' },
  { value: 'America/New_York', label: 'New York (UTC-5/-4)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)' },
];
