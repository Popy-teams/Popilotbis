import { useState } from 'react';
import { AlertTriangle, Bot, MessageSquare, Send, Sparkles } from 'lucide-react';
import { ASSISTANT_SUGGESTIONS } from './dashboardPresentation';
import { personalInputClass } from '../personal/personalFormStyles';
import { DashboardCardShell } from './DashboardCardShell';

interface DashboardAssistantTabProps {
  onDeclareBlockage: () => void;
}

export function DashboardAssistantTab({ onDeclareBlockage }: DashboardAssistantTabProps) {
  const [query, setQuery] = useState('');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 min-w-0">
      <DashboardCardShell accent="from-red-500 to-rose-600" className="h-full">
        <div className="p-5 sm:p-6 flex flex-col h-full">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-red-100 text-red-700 shrink-0 ring-4 ring-red-50">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Signaler un blocage</h2>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                Un obstacle sur une tâche ? Déclenchez une action corrective — c&apos;est une bonne
                pratique, pas un échec.
              </p>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-xs text-slate-600 flex-1">
            <li className="flex items-center gap-2">• Notification immédiate au chef de projet</li>
            <li className="flex items-center gap-2">• Ajout au registre des risques</li>
            <li className="flex items-center gap-2">• Réponse sous 24 h</li>
          </ul>
          <button
            type="button"
            onClick={onDeclareBlockage}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm"
          >
            <AlertTriangle className="w-4 h-4" />
            Je suis bloqué
          </button>
        </div>
      </DashboardCardShell>

      <DashboardCardShell accent="from-violet-500 to-indigo-600" className="h-full">
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3 mb-5">
            <div className="p-3 rounded-2xl bg-violet-600 text-white shrink-0 shadow-sm">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Assistant POPILOT
                <Sparkles className="w-4 h-4 text-violet-500" />
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Priorités, retards et décisions récentes du projet.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-violet-100 bg-slate-50/80 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Sur quoi me concentrer aujourd'hui ?"
                className={personalInputClass}
              />
              <button
                type="button"
                className="shrink-0 p-2.5 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-sm"
                aria-label="Envoyer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {ASSISTANT_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setQuery(suggestion)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-violet-200 bg-white text-violet-800 hover:bg-violet-50 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-dashed border-violet-200 bg-violet-50/40 p-4 flex items-start gap-2 text-xs text-violet-900">
            <MessageSquare className="w-4 h-4 shrink-0 mt-0.5 opacity-70" />
            L&apos;assistant analyse vos tâches et l&apos;état du projet pour vous proposer des
            recommandations personnalisées.
          </div>
        </div>
      </DashboardCardShell>
    </div>
  );
}
