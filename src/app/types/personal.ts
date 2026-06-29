export type PersonalTab = 'overview' | 'profile' | 'preferences' | 'security';

export interface NotificationPreferences {
  emailTasks: boolean;
  emailMeetings: boolean;
  emailMentions: boolean;
  weeklyDigest: boolean;
  pushEnabled: boolean;
}

export interface PersonalProfile {
  userId: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  phone: string;
  mobile: string;
  office: string;
  bio: string;
  timezone: string;
  language: 'fr' | 'en';
  linkedIn: string;
  avatarUrl: string;
  notifications: NotificationPreferences;
  updatedAt: string;
}
