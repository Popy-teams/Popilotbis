import { useState } from 'react';
import { ChevronLeft, ChevronRight, Bot } from 'lucide-react';
import type { TaquinMessage } from '../../../types/teamSpace';
import { TeamSpaceIconBadge, taquinIconKey } from '../teamSpaceIcons';

export function TaquinCarousel({ messages }: { messages: TaquinMessage[] }) {
  const [index, setIndex] = useState(0);
  const msg = messages[index];
  if (!msg) return null;

  const prev = () => setIndex((i) => (i - 1 + messages.length) % messages.length);
  const next = () => setIndex((i) => (i + 1) % messages.length);

  return (
    <div className="saas-surface overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Popi-Bot</p>
              <p className="text-xs text-slate-500">Humour & observations sur l&apos;activité</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prev}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors"
              aria-label="Message précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-500 tabular-nums min-w-[3rem] text-center">
              {index + 1}/{messages.length}
            </span>
            <button
              type="button"
              onClick={next}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors"
              aria-label="Message suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <TeamSpaceIconBadge iconKey={taquinIconKey(msg)} size="lg" />
          <p className="text-slate-700 text-base leading-relaxed flex-1 pt-1">{msg.text}</p>
        </div>

        <div className="flex justify-center gap-1.5 mt-5">
          {messages.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-amber-600' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Message ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
