/** Membres sélectionnables pour les projets (visibilité + équipe) */
export interface PortfolioMember {
  id: string;
  name: string;
  initials: string;
  email?: string;
}

export const PORTFOLIO_MEMBERS: PortfolioMember[] = [
  { id: 'user-shirel', name: 'Shirel', initials: 'SH', email: 'shirel@popy-robot.com' },
  { id: 'user-sonia', name: 'Sonia Laurent', initials: 'SO', email: 'sonia@popilot.com' },
  { id: 'user-1', name: 'Alice Martin', initials: 'AM', email: 'alice@popilot.com' },
  { id: 'user-2', name: 'Bob Dupont', initials: 'BD', email: 'bob@popilot.com' },
  { id: 'user-3', name: 'Claire Rousseau', initials: 'CR', email: 'claire@popilot.com' },
  { id: 'user-4', name: 'David Leroy', initials: 'DL', email: 'david@popilot.com' },
  { id: 'user-5', name: 'Emma Bernard', initials: 'EB', email: 'emma@popilot.com' },
  { id: 'user-6', name: 'Fabio Garcia', initials: 'FG', email: 'fabio@popilot.com' },
  { id: 'user-7', name: 'Meriem Zahzouh', initials: 'ME', email: 'meriem@popilot.com' },
  { id: 'admin', name: 'Jean Dupont', initials: 'JD', email: 'admin@popilot.com' },
];

export function resolveMemberIdForUser(user: { id: string; email: string; role: string }): string {
  const byEmail = PORTFOLIO_MEMBERS.find(
    (m) => m.email?.toLowerCase() === user.email.toLowerCase()
  );
  if (byEmail) return byEmail.id;
  if (user.role === 'admin') return 'admin';
  return user.id;
}
