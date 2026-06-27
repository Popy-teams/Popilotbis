import { useMemo, useState } from 'react';
import { MessageSquarePlus, ThumbsUp, Trophy } from 'lucide-react';
import type { TeamQuote } from '../../../types/teamSpace';
import { MemberAvatar, formatRelativeTime } from './MemberAvatar';

type SortMode = 'popular' | 'recent';

interface Props {
  quotes: TeamQuote[];
  currentUserId: string;
  currentUserName: string;
  onPublish: (text: string, context?: string) => void;
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
    onPublish(text.trim(), context.trim() || undefined);
    setText('');
    setContext('');
  };

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="rounded-xl border border-slate-200 bg-white saas-surface overflow-hidden">
          {composerOpen ? (
            <div className="p-4 space-y-3">
              <div className="flex gap-3">
                <MemberAvatar name={currentUserName} />
                <div className="flex-1 space-y-2">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={2}
                    placeholder="Une phrase culte à immortaliser…"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500 resize-none"
                  />
                  <input
                    type="text"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Contexte (optionnel)"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setComposerOpen(false)} className="text-sm text-slate-500 px-3 py-2">
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={publish}
                  disabled={!text.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-40"
                >
                  Publier
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setComposerOpen(true)}
              className="w-full p-4 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors"
            >
              <MemberAvatar name={currentUserName} size="sm" />
              <span className="text-sm text-slate-500 flex-1 px-4 py-2.5 rounded-full bg-slate-100">
                Partager une citation d&apos;équipe…
              </span>
              <MessageSquarePlus className="w-5 h-5 text-slate-400" />
            </button>
          )}
        </div>
      )}

      {!compact && topQuote && topQuote.votes.length >= 3 && (
        <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 flex gap-3">
          <Trophy className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Citation du moment</p>
            <p className="text-slate-800 font-medium mt-1">« {topQuote.text} »</p>
            <p className="text-xs text-slate-500 mt-1">
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
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                sort === mode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mode === 'popular' ? 'Populaires' : 'Récentes'}
            </button>
          ))}
        </div>
      )}

      <div className={`space-y-3 ${compact ? '' : ''}`}>
        {display.map((q) => {
          const voted = q.votes.includes(currentUserId);
          return (
            <article
              key={q.id}
              className="saas-surface p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-3">
                <MemberAvatar name={q.authorName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-slate-900">{q.authorName}</span>
                    <time className="text-xs text-slate-400">{formatRelativeTime(q.createdAt)}</time>
                    {q.context && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{q.context}</span>
                    )}
                  </div>
                  <p className="text-slate-800 mt-2 text-[15px] leading-relaxed">« {q.text} »</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => onVote(q.id)}
                  className={`inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full transition-all active:scale-95 ${
                    voted ? 'bg-amber-100 text-amber-800' : 'text-slate-600 hover:bg-slate-100'
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
