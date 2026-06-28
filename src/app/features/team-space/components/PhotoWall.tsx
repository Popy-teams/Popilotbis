import { useMemo } from 'react';
import { Images } from 'lucide-react';
import type { ChallengeResponse, TeamQuote } from '../../../types/teamSpace';
import { MemberAvatar } from './MemberAvatar';

interface PhotoWallProps {
  quotes: TeamQuote[];
  responses: ChallengeResponse[];
  weekKey: string;
}

type PhotoItem = { id: string; imageUrl: string; authorName: string; authorId: string; caption?: string };

export function PhotoWall({ quotes, responses, weekKey }: PhotoWallProps) {
  const items = useMemo(() => {
    const fromQuotes: PhotoItem[] = quotes
      .filter((q) => q.imageUrl)
      .map((q) => ({
        id: q.id,
        imageUrl: q.imageUrl!,
        authorName: q.authorName,
        authorId: q.authorId,
        caption: q.text.slice(0, 60),
      }));
    const fromChallenge: PhotoItem[] = responses
      .filter((r) => r.weekKey === weekKey && r.imageUrl)
      .map((r) => ({
        id: r.id,
        imageUrl: r.imageUrl!,
        authorName: r.authorName,
        authorId: r.authorId,
        caption: r.content.slice(0, 60),
      }));
    return [...fromChallenge, ...fromQuotes].slice(0, 12);
  }, [quotes, responses, weekKey]);

  if (items.length === 0) return null;

  return (
    <section className="ts-animate-in">
      <div className="flex items-center gap-2 mb-3">
        <Images className="w-5 h-5 text-violet-600" />
        <h2 className="font-bold text-slate-900 text-lg">Mur photos</h2>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
          {items.length}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {items.map((item, i) => (
          <figure
            key={item.id}
            className="ts-photo-tile relative rounded-2xl overflow-hidden aspect-square bg-slate-100 shadow-sm group"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-2 pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1.5">
                <MemberAvatar memberId={item.authorId} name={item.authorName} size="sm" />
                <p className="text-[10px] text-white font-medium truncate">{item.authorName}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
