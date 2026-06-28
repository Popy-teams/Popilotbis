import { useMemo, useState } from 'react';
import { MessageSquarePlus, ThumbsUp, Trophy, Sparkles } from 'lucide-react';
import type { TeamQuote } from '../../../types/teamSpace';
import { MemberAvatar, formatRelativeTime } from './MemberAvatar';
import { PhotoPicker } from './PhotoPicker';

type SortMode = 'popular' | 'recent';

interface Props {
  quotes: TeamQuote[];
  currentUserId: string;
  currentUserName: string;
  onPublish: (text: string, context?: string, imageUrl?: string) => void;
  onVote: (quoteId: string) => void;
  compact?: boolean;
}

export function QuotesWallPanel({
  quotes,
  currentUserId,
  currentUserName,
  onPublish,
  onVote,
  compact = false,
}: Props) {
  const [text, setText] = useState('');
  const [context, setContext] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [sort, setSort] = useState<SortMode>('popular');
  const [composerOpen, setComposerOpen] = useState(!compact);

  const sorted = useMemo(() => {
    const list = [...quotes];
    if (sort === 'popular') return list.sort((a, b) => b.votes.length - a.votes.length);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [quotes, sort]);

  const display = compact ? sorted.slice(0, 4) : sorted;
  const topQuote = [...quotes].sort((a, b) => b.votes.length - a.votes.length)[0];

  const publish = () => {
    if (!text.trim()) return;
    onPublish(text.trim(), context.trim() || undefined, imageUrl);
    setText('');
    setContext('');
    setImageUrl(undefined);
  };

  return (
    <div className="space-y-5">
      {!compact && (
        <div className="rounded-2xl border border-rose-200/50 bg-white shadow-lg overflow-hidden ts-card-glow">
          {composerOpen ? (
            <div className="p-5 space-y-4 bg-gradient-to-br from-rose-50/30 to-violet-50/20">
              <div className="flex gap-3">
                <MemberAvatar memberId={currentUserId} name={currentUserName} />
                <div className="flex-1 space-y-3">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={3}
                    placeholder="Une phrase culte à immortaliser…"
                    className="w-full px-4 py-3 rounded-xl border border-rose-200/60 bg-white text-sm focus:ring-2 focus:ring-rose-400/40 resize-none"
                  />
                  <input
                    type="text"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Contexte (optionnel)"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                  <PhotoPicker value={imageUrl} onChange={setImageUrl} label="Ajouter une photo à la citation" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setComposerOpen(false)}
                  className="text-sm text-slate-500 px-3 py-2"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={publish}
                  disabled={!text.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white text-sm font-bold hover:shadow-lg disabled:opacity-40 transition-all hover:scale-[1.02]"
                >
                  Publier
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setComposerOpen(true)}
              className="w-full p-5 flex items-center gap-3 text-left hover:bg-rose-50/50 transition-colors"
            >
              <MemberAvatar memberId={currentUserId} name={currentUserName} size="sm" />
              <span className="text-sm text-slate-500 flex-1 px-4 py-3 rounded-full bg-slate-100 border border-slate-200">
                Partager une citation (+ photo)…
              </span>
              <MessageSquarePlus className="w-5 h-5 text-rose-400" />
            </button>
          )}
        </div>
      )}

      {!compact && topQuote && topQuote.votes.length >= 3 && (
        <div className="rounded-2xl border border-amber-300/60 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 p-5 flex gap-4 shadow-md ts-animate-in">
          <Trophy className="w-8 h-8 text-amber-500 shrink-0 ts-animate-float" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-amber-800 uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Citation du moment
            </p>
            <p className="text-slate-900 font-semibold mt-2 text-lg">« {topQuote.text} »</p>
            {topQuote.imageUrl ? (
              <img src={topQuote.imageUrl} alt="" className="mt-3 rounded-xl max-h-40 object-cover border border-amber-200" />
            ) : null}
            <p className="text-xs text-slate-500 mt-2">
              {topQuote.authorName} · {topQuote.votes.length} votes
            </p>
          </div>
        </div>
      )}

      {!compact && (
        <div className="flex gap-2">
          {(['popular', 'recent'] as SortMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSort(mode)}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                sort === mode
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-violet-300'
              }`}
            >
              {mode === 'popular' ? 'Populaires' : 'Récentes'}
            </button>
          ))}
        </div>
      )}

      <div className={`grid gap-4 ${compact ? '' : 'sm:grid-cols-2'}`}>
        {display.map((q, i) => {
          const voted = q.votes.includes(currentUserId);
          return (
            <article
              key={q.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm ts-card-glow ts-animate-in overflow-hidden"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              {q.imageUrl ? (
                <img src={q.imageUrl} alt="" className="w-full h-36 object-cover rounded-xl mb-3 -mx-0" />
              ) : null}
              <div className="flex gap-3">
                <MemberAvatar memberId={q.authorId} name={q.authorName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-slate-900">{q.authorName}</span>
                    <time className="text-xs text-slate-400">{formatRelativeTime(q.createdAt)}</time>
                    {q.context && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">{q.context}</span>
                    )}
                  </div>
                  <p className="text-slate-800 mt-2 text-[15px] leading-relaxed font-medium">« {q.text} »</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onVote(q.id)}
                  className={`inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95 ${
                    voted
                      ? 'bg-violet-100 text-violet-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${voted ? 'fill-current' : ''}`} />
                  {q.votes.length}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
