import { useState } from 'react';
import { Heart, Send, Users, Sparkles } from 'lucide-react';
import type { ChallengeResponse, WeeklyChallenge } from '../../../types/teamSpace';
import { TeamSpaceIconBadge, challengeIconKey } from '../teamSpaceIcons';
import { MemberAvatar, formatRelativeTime } from './MemberAvatar';
import { PhotoPicker } from './PhotoPicker';
import { getWeekKey } from '../../../utils/teamSpaceTime';

interface Props {
  challenge: WeeklyChallenge;
  responses: ChallengeResponse[];
  currentUserId: string;
  currentUserName: string;
  onSubmit: (content: string, imageUrl?: string) => void;
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
  const [draftPhoto, setDraftPhoto] = useState<string | undefined>();
  const weekKey = getWeekKey();
  const weekResponses = responses.filter((r) => r.weekKey === weekKey);
  const iconKey = challengeIconKey(challenge);

  const submit = () => {
    if (!draft.trim()) return;
    onSubmit(draft.trim(), draftPhoto);
    setDraft('');
    setDraftPhoto(undefined);
  };

  return (
    <div className={`flex flex-col ${compact ? '' : 'min-h-[28rem]'}`}>
      <div className="rounded-2xl border border-violet-200/50 bg-white shadow-lg overflow-hidden ts-card-glow">
        <div className="px-5 py-5 border-b border-violet-100 flex items-start gap-4 bg-gradient-to-r from-violet-50/80 to-fuchsia-50/50">
          <TeamSpaceIconBadge iconKey={iconKey} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-violet-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Défi de la semaine
            </p>
            <h2 className="font-black text-slate-900 text-xl mt-0.5">{challenge.title}</h2>
            <p className="text-sm text-slate-600 mt-1">{challenge.description}</p>
            <p className="text-sm text-violet-800/90 mt-2 font-medium italic border-l-2 border-violet-400 pl-3">
              {challenge.prompt}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-violet-700 bg-white px-3 py-2 rounded-xl shadow-sm shrink-0">
            <Users className="w-4 h-4" />
            {weekResponses.length}
          </div>
        </div>

        <div
          className={`p-4 space-y-3 ${compact ? 'max-h-72 overflow-y-auto' : 'flex-1 overflow-y-auto max-h-[26rem]'}`}
        >
          {weekResponses.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-10">Soyez le premier à relever le défi.</p>
          ) : (
            weekResponses.map((r) => {
              const liked = r.likes.includes(currentUserId);
              return (
                <article
                  key={r.id}
                  className="flex gap-3 p-3 rounded-2xl hover:bg-violet-50/50 transition-colors group border border-transparent hover:border-violet-100"
                >
                  <MemberAvatar memberId={r.authorId} name={r.authorName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-900">{r.authorName}</span>
                      <time className="text-xs text-slate-400">{formatRelativeTime(r.createdAt)}</time>
                    </div>
                    <p className="text-sm text-slate-700 mt-1 leading-relaxed">{r.content}</p>
                    {r.imageUrl ? (
                      <img
                        src={r.imageUrl}
                        alt=""
                        className="mt-2 rounded-xl max-h-48 w-full object-cover border border-slate-200 shadow-sm"
                      />
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onLike(r.id)}
                      className={`mt-2 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all active:scale-95 ${
                        liked
                          ? 'bg-rose-100 text-rose-700'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
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

        <div className="p-4 border-t border-violet-100 bg-gradient-to-r from-slate-50 to-violet-50/30">
          <div className="flex gap-3 items-start">
            <MemberAvatar memberId={currentUserId} name={currentUserName} size="sm" />
            <div className="flex-1 space-y-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                rows={2}
                placeholder="Votre réponse… (+ photo optionnelle)"
                className="w-full px-4 py-2.5 rounded-xl border border-violet-200 bg-white text-sm resize-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
              />
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <PhotoPicker value={draftPhoto} onChange={setDraftPhoto} compact label="Photo" />
                <button
                  type="button"
                  onClick={submit}
                  disabled={!draft.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-40 transition-all hover:scale-[1.02] active:scale-95 shadow-md"
                >
                  <Send className="w-4 h-4" />
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
