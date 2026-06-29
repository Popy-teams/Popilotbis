import { ChevronRight } from 'lucide-react';
import type { ProcessData } from '../../data/testProcesses';

type ProcessStep = ProcessData['steps'][number];

function stepStatusClasses(status: ProcessStep['status']) {
  if (status === 'done') {
    return {
      card: 'border-green-300 bg-green-50',
      badge: 'bg-green-600 text-white',
    };
  }
  if (status === 'in-progress') {
    return {
      card: 'border-blue-300 bg-blue-50',
      badge: 'bg-blue-600 text-white',
    };
  }
  return {
    card: 'border-gray-300 bg-white',
    badge: 'bg-gray-300 text-gray-700',
  };
}

function StepBadge({ step, index }: { step: ProcessStep; index: number }) {
  const { badge } = stepStatusClasses(step.status);
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${badge}`}>
      {index + 1}
    </div>
  );
}

interface ProcessMapCardProps {
  steps: ProcessStep[];
}

export function ProcessMapCard({ steps }: ProcessMapCardProps) {
  if (steps.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
        Aucune étape définie pour ce processus.
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
      {/* Mobile : timeline verticale */}
      <ol className="md:hidden space-y-0">
        {steps.map((step, index) => {
          const { card } = stepStatusClasses(step.status);
          return (
            <li key={step.id} className="flex gap-3 min-w-0">
              <div className="flex flex-col items-center shrink-0">
                <StepBadge step={step} index={index} />
                {index < steps.length - 1 ? (
                  <div className="w-0.5 flex-1 min-h-6 bg-gray-300 my-1" aria-hidden />
                ) : null}
              </div>
              <div className={`flex-1 min-w-0 rounded-lg border-2 p-3 mb-3 ${card}`}>
                <p className="text-sm font-semibold text-gray-900 break-words">{step.title}</p>
                {step.description ? (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{step.description}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Tablette / desktop : carte horizontale avec retour à la ligne */}
      <div className="hidden md:flex flex-wrap items-center gap-y-4 gap-x-1">
        {steps.map((step, index) => {
          const { card } = stepStatusClasses(step.status);
          return (
            <div key={step.id} className="flex items-center min-w-0">
              <div
                className={`flex flex-col items-center p-3 sm:p-4 rounded-lg border-2 w-[7.5rem] sm:w-32 lg:w-36 shrink-0 ${card}`}
              >
                <StepBadge step={step} index={index} />
                <div className="text-xs font-semibold text-center text-gray-900 line-clamp-3 mt-2 w-full">
                  {step.title}
                </div>
              </div>
              {index < steps.length - 1 ? (
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 mx-0.5 sm:mx-1 shrink-0" aria-hidden />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
