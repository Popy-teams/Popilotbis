/** Images fixtures — clés = ids onglet Équipe (testTeamData). */

const img = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/popilot-${seed}/${w}/${h}`;

export const DEMO_MEMBER_PHOTO_URLS: Record<string, string> = {
  'user-sonia': img('avatar-sonia', 256, 256),
  'user-erwan': img('avatar-erwan', 256, 256),
  'user-yacine': img('avatar-yacine', 256, 256),
  'user-fabio': img('avatar-fabio', 256, 256),
  'user-meriem': img('avatar-meriem', 256, 256),
  'user-claude': img('avatar-claude', 256, 256),
  'user-data-ia': img('avatar-sarah', 256, 256),
  'user-cyber': img('avatar-marc', 256, 256),
  'user-rgpd': img('avatar-julie', 256, 256),
  'user-cloud': img('avatar-david', 256, 256),
  'user-data': img('avatar-emma', 256, 256),
};

export const DEMO_QUOTE_IMAGES = {
  quote1: img('quote-desk', 800, 520),
  quote3: img('quote-robot', 800, 520),
  quote5: img('quote-code', 800, 520),
  quote10: img('quote-laptop', 800, 520),
} as const;

export const DEMO_CHALLENGE_IMAGES = {
  cr1: img('challenge-coffee', 800, 520),
  cr2: img('challenge-robot', 800, 520),
  cr7: img('challenge-office', 800, 520),
  cr5: img('challenge-team', 800, 520),
} as const;
