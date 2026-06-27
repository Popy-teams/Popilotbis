import { useState } from 'react';
import { Heart, Send, Users } from 'lucide-react';
import type { ChallengeResponse, WeeklyChallenge } from '../../../types/teamSpace';
import { TeamSpaceIconBadge, challengeIconKey } from '../teamSpaceIcons';
import { MemberAvatar, formatRelativeTime } from './MemberAvatar';
import { getWeekKey } from '../../../utils/teamSpaceTime';

interface Props {
  challenge: WeeklyChallenge;
  responses: ChallengeResponse[];
  currentUserId: string;
  currentUserName: string;
  onSubmit: (content: string) => void;
  onLike: (responseId: string) => void;
  compact?: boolean;
}

export function WeeklyChallengePanel({
  challenge,
  responses,
  currentUserId,
  currentUserName,
  onSubmit,
  onLike,
  compact = false,
}: Props) {
  const [draft, setDraft] = useState('');
  const weekKey = getWeekKey();
  const weekResponses = responses.filter((r) => r.weekKey === weekKey);
  const iconKey = challengeIconKey(challenge);

  const submit = () => {
    if (!draft.trim()) return;
    onSubmit(draft.trim());
    setDraft('');
  };

  return (
    <div className={`flex flex-col ${compact ? '' : 'min-h-[32rem]'}`}>
      <div className="saas-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-start gap-4 bg-slate-50/50">
          <TeamSpaceIconBadge iconKey={iconKey} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Défi de la semaine</p>
            <h2 className="font-bold text-slate-900 text-lg mt-0.5">{challenge.title}</h2>
            <p className="text-sm text-slate-600 mt-1">{challenge.description}</p>
            <p className="text-sm text-slate-700 mt-2 font-medium italic">{challenge.prompt}</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg shrink-0">
            <Users className="w-3.5 h-3.5" />
            {weekResponses.length}
          </div>
        </div>

        <div className={`p-4 space-y-3 ${compact ? 'max-h-64 overflow-y-auto' : 'flex-1 overflow-y-auto max-h-[28rem]'}`}>
          {weekResponses.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Aucune réponse — lancez la conversation.</p>
          ) : (
            weekResponses.map((r) => {
              const liked = r.likes.includes(currentUserId);
              return (
                <article
                  key={r.id}
                  className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <MemberAvatar name={r.authorName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-900">{r.authorName}</span>
                      <time className="text-xs text-slate-400">{formatRelativeTime(r.createdAt)}</time>
                    </div>
                    <p className="text-sm text-slate-700 mt-1 leading-relaxed">{r.content}</p>
                    <button
                      type="button"
                      onClick={() => onLike(r.id)}
                      className={`mt-2 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all active:scale-95 ${
                        liked
                          ? 'bg-rose-100 text-rose-700'
                          : 'text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-slate-100'
                      } ${liked ? 'opacity-100' : ''}`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
                      {r.likes.length || (liked ? 1 : 0)}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/80">
          <div className="flex gap-2 items-end">
            <MemberAvatar name={currentUserName} size="sm" />
            <div className="flex-1 flex gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                rows={1}
                placeholder="Votre réponse… (Entrée pour envoyer)"
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm resize-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 min-h-[42px]"
              />
              <button
                type="button"
                onClick={submit}
                disabled={!draft.trim()}
                className="p-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
