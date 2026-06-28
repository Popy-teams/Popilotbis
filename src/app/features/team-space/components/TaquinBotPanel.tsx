import { useState } from 'react';
import { ChevronLeft, ChevronRight, Bot, Sparkles } from 'lucide-react';
import type { TaquinMessage } from '../../../types/teamSpace';
import { TeamSpaceIconBadge, taquinIconKey } from '../teamSpaceIcons';

export function TaquinCarousel({ messages }: { messages: TaquinMessage[] }) {
  const [index, setIndex] = useState(0);
  const msg = messages[index];
  if (!msg) return null;

  const prev = () => setIndex((i) => (i - 1 + messages.length) % messages.length);
  const next = () => setIndex((i) => (i + 1) % messages.length);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-200/60 bg-white shadow-lg ts-card-glow">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-fuchsia-500/5 to-sky-500/5 pointer-events-none" />
      <div className="relative p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shrink-0 shadow-lg ts-animate-float">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                Popi-Bot
                <Sparkles className="w-4 h-4 text-amber-500 ts-sparkle" />
              </p>
              <p className="text-xs text-slate-500">Humour live · données projet</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prev}
              className="p-2 rounded-xl border border-violet-200 hover:bg-violet-50 text-violet-600 transition-all hover:scale-105"
              aria-label="Message précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-violet-600 tabular-nums min-w-[3rem] text-center">
              {index + 1}/{messages.length}
            </span>
            <button
              type="button"
              onClick={next}
              className="p-2 rounded-xl border border-violet-200 hover:bg-violet-50 text-violet-600 transition-all hover:scale-105"
              aria-label="Message suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div key={msg.id} className="flex gap-4 items-start ts-animate-in">
          <TeamSpaceIconBadge iconKey={taquinIconKey(msg)} size="lg" />
          <p className="text-slate-800 text-lg leading-relaxed flex-1 pt-1 font-medium">{msg.text}</p>
        </div>

        <div className="flex justify-center gap-1.5 mt-6">
          {messages.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? 'w-8 bg-gradient-to-r from-violet-600 to-fuchsia-500' : 'w-2 bg-slate-300 hover:bg-violet-300'
              }`}
              aria-label={`Message ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
