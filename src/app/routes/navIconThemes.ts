import type { ViewType } from './viewRoutes';

/** Icônes sidebar — fond pastel + teinte (toujours visible) */
export const NAV_ICON_THEMES: Record<ViewType, { wrap: string; icon: string; indicator?: string }> = {
  'my-dashboard': { wrap: 'bg-sky-100 border-sky-200', icon: 'text-sky-700', indicator: '#0284c7' },
  'personal-space': { wrap: 'bg-blue-100 border-blue-200', icon: 'text-blue-800', indicator: '#1d4ed8' },
  dashboard: { wrap: 'bg-indigo-100 border-indigo-200', icon: 'text-indigo-700', indicator: '#4f46e5' },
  projects: { wrap: 'bg-violet-100 border-violet-200', icon: 'text-violet-700', indicator: '#7c3aed' },
  process: { wrap: 'bg-orange-100 border-orange-200', icon: 'text-orange-700', indicator: '#ea580c' },
  pipeline: { wrap: 'bg-cyan-100 border-cyan-200', icon: 'text-cyan-700', indicator: '#0891b2' },
  tasks: { wrap: 'bg-blue-100 border-blue-200', icon: 'text-blue-700', indicator: '#2563eb' },
  team: { wrap: 'bg-teal-100 border-teal-200', icon: 'text-teal-700', indicator: '#0d9488' },
  'team-space': { wrap: 'bg-pink-100 border-pink-200', icon: 'text-pink-700', indicator: '#db2777' },
  meetings: { wrap: 'bg-slate-200 border-slate-300', icon: 'text-slate-700', indicator: '#475569' },
  calendar: { wrap: 'bg-purple-100 border-purple-200', icon: 'text-purple-700', indicator: '#9333ea' },
  budget: { wrap: 'bg-emerald-100 border-emerald-200', icon: 'text-emerald-700', indicator: '#059669' },
  risks: { wrap: 'bg-red-100 border-red-200', icon: 'text-red-700', indicator: '#dc2626' },
  veille: { wrap: 'bg-cyan-100 border-cyan-200', icon: 'text-cyan-800', indicator: '#0e7490' },
  marketing: { wrap: 'bg-fuchsia-100 border-fuchsia-200', icon: 'text-fuchsia-700', indicator: '#c026d3' },
  satisfaction: { wrap: 'bg-lime-100 border-lime-200', icon: 'text-lime-800', indicator: '#65a30d' },
  audit: { wrap: 'bg-amber-100 border-amber-200', icon: 'text-amber-800', indicator: '#d97706' },
  kpi: { wrap: 'bg-orange-100 border-orange-200', icon: 'text-orange-700', indicator: '#ea580c' },
  pdca: { wrap: 'bg-violet-100 border-violet-200', icon: 'text-violet-700', indicator: '#7c3aed' },
  documentation: { wrap: 'bg-blue-100 border-blue-200', icon: 'text-blue-800', indicator: '#1d4ed8' },
};
