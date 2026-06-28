import { avatarGradient, initialsFromName } from '../teamSpaceIcons';
import { useTeamSpacePhotos } from '../TeamSpacePhotoContext';

export function MemberAvatar({
  name,
  memberId,
  photoUrl,
  size = 'md',
  ring = false,
}: {
  name: string;
  memberId?: string;
  photoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  ring?: boolean;
}) {
  const { getPhoto } = useTeamSpacePhotos();
  const resolved = photoUrl ?? (memberId ? getPhoto(memberId) : undefined);

  const dim =
    size === 'sm'
      ? 'w-8 h-8 text-xs'
      : size === 'lg'
        ? 'w-14 h-14 text-base'
        : size === 'xl'
          ? 'w-20 h-20 text-lg'
          : 'w-10 h-10 text-sm';

  const ringClass = ring
    ? 'ring-2 ring-violet-400 ring-offset-2 ring-offset-white'
    : '';

  if (resolved) {
    return (
      <img
        src={resolved}
        alt={name}
        title={name}
        className={`${dim} rounded-full object-cover shrink-0 shadow-md ${ringClass}`}
      />
    );
  }

  return (
    <div
      className={`${dim} rounded-full bg-gradient-to-br ${avatarGradient(name)} text-white font-bold flex items-center justify-center shrink-0 shadow-md ${ringClass}`}
      title={name}
    >
      {initialsFromName(name)}
    </div>
  );
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `Il y a ${d} j`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
