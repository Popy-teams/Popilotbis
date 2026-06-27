import { avatarGradient, initialsFromName } from '../teamSpaceIcons';

export function MemberAvatar({
  name,
  size = 'md',
  ring = false,
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  ring?: boolean;
}) {
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm';
  return (
    <div
      className={`${dim} rounded-full bg-gradient-to-br ${avatarGradient(name)} text-white font-bold flex items-center justify-center shrink-0 shadow-sm ${
        ring ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-50' : ''
      }`}
      title={name}
    >
      {initialsFromName(name)}
    </div>
  );
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'À l\'instant';
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `Il y a ${d} j`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
