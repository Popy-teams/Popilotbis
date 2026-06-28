import { useRef, useState } from 'react';
import { Camera, PartyPopper, Sparkles, Zap, Medal, Target, MessageSquareQuote } from 'lucide-react';
import { readImageFile, saveMemberPhoto } from '../../../utils/teamSpacePhotos';
import { MemberAvatar } from './MemberAvatar';

interface TeamSpaceHeaderProps {
  memberId: string;
  memberName: string;
  projectName: string;
  weekKey: string;
  myPoints: number;
  myRank: number;
  challengeCount: number;
  quoteCount: number;
  onPhotoUpdated: () => void;
}

export function TeamSpaceHeader({
  memberId,
  memberName,
  projectName,
  weekKey,
  myPoints,
  myRank,
  challengeCount,
  quoteCount,
  onPhotoUpdated,
}: TeamSpaceHeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await readImageFile(file);
      saveMemberPhoto(memberId, dataUrl);
      onPhotoUpdated();
    } catch {
      /* ignore */
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const stats = [
    { icon: Zap, label: 'Points', value: myPoints, color: 'from-violet-500 to-fuchsia-500' },
    { icon: Medal, label: 'Rang', value: myRank > 0 ? (myRank === 1 ? '1er' : `${myRank}e`) : '—', color: 'from-sky-500 to-indigo-500' },
    { icon: Target, label: 'Défis', value: challengeCount, color: 'from-cyan-500 to-teal-500' },
    { icon: MessageSquareQuote, label: 'Citations', value: quoteCount, color: 'from-rose-500 to-pink-500' },
  ];

  return (
    <header className="relative overflow-hidden rounded-2xl border border-violet-200/50 bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-50/80 via-white to-fuchsia-50/60 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

      <div className="relative z-10 p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center gap-5">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="relative group shrink-0"
            title="Changer votre photo"
          >
            <MemberAvatar memberId={memberId} name={memberName} size="xl" ring />
            <span className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </span>
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={upload} />

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <PartyPopper className="w-5 h-5 text-violet-600 shrink-0" />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Espace <span className="ts-shimmer-text">Équipe</span>
              </h1>
            </div>
            <p className="text-sm text-slate-600 mt-1 truncate">
              {projectName} · Semaine {weekKey}
            </p>
            <p className="text-xs text-violet-600/90 mt-0.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Bot, défis, citations & podium live
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:shrink-0">
          {stats.map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="ts-card-glow rounded-xl border border-white/80 bg-white/90 p-3 text-center shadow-sm"
            >
              <div
                className={`inline-flex p-1.5 rounded-lg bg-gradient-to-br ${color} text-white mb-1.5`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <p className="text-lg font-black text-slate-900 tabular-nums leading-none">{value}</p>
              <p className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
