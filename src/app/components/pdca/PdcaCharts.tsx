import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PdcaPhase, PdcaPhaseStats, PdcaSnapshot } from '../../types/pdca';
import { PDCA_CHART_COLORS, PDCA_PHASE_META } from '../../utils/pdcaCatalog';

interface PdcaChartsProps {
  snapshot: PdcaSnapshot;
  activePhase?: PdcaPhase | 'all';
}

export function PdcaChartsOverview({ snapshot }: { snapshot: PdcaSnapshot }) {
  const pieData = snapshot.phaseStats.map((s) => ({
    name: PDCA_PHASE_META[s.phase].label,
    value: s.total,
    phase: s.phase,
  }));

  const radarData = snapshot.phaseStats.map((s) => ({
    phase: PDCA_PHASE_META[s.phase].letter,
    completion: s.completionRate,
    volume: Math.min(100, s.total * 4),
  }));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <ChartCard title="Répartition P · D · C · A" subtitle="Volume d'éléments par phase">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={56} outerRadius={92} paddingAngle={3}>
              {pieData.map((entry) => (
                <Cell key={entry.phase} fill={PDCA_CHART_COLORS[entry.phase as PdcaPhase]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => [`${v} éléments`, 'Volume']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Maturité par phase" subtitle="Taux d'achèvement (%) et intensité">
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e7e5e4" />
            <PolarAngleAxis dataKey="phase" tick={{ fill: '#57534e', fontSize: 12, fontWeight: 600 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#a8a29e', fontSize: 10 }} />
            <Radar name="Achèvement %" dataKey="completion" stroke="#2563eb" fill="#2563eb" fillOpacity={0.35} />
            <Radar name="Intensité" dataKey="volume" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} />
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

export function PdcaChartsTrend({ snapshot }: { snapshot: PdcaSnapshot }) {
  return (
    <ChartCard title="Évolution de la boucle PDCA" subtitle="6 derniers mois — flux par phase">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={snapshot.trend}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis dataKey="month" tick={{ fill: '#78716c', fontSize: 12 }} />
          <YAxis tick={{ fill: '#78716c', fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="plan" name="Plan" stroke={PDCA_CHART_COLORS.plan} strokeWidth={2.5} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="do" name="Do" stroke={PDCA_CHART_COLORS.do} strokeWidth={2.5} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="check" name="Check" stroke={PDCA_CHART_COLORS.check} strokeWidth={2.5} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="act" name="Act" stroke={PDCA_CHART_COLORS.act} strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function PdcaChartsModules({ snapshot }: { snapshot: PdcaSnapshot }) {
  return (
    <ChartCard title="Cartographie modules → PDCA" subtitle="Répartition par source POPILOT">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={snapshot.moduleCounts} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#78716c', fontSize: 11 }} />
          <YAxis type="category" dataKey="module" width={110} tick={{ fill: '#57534e', fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="plan" name="Plan" stackId="a" fill={PDCA_CHART_COLORS.plan} radius={[0, 0, 0, 0]} />
          <Bar dataKey="do" name="Do" stackId="a" fill={PDCA_CHART_COLORS.do} />
          <Bar dataKey="check" name="Check" stackId="a" fill={PDCA_CHART_COLORS.check} />
          <Bar dataKey="act" name="Act" stackId="a" fill={PDCA_CHART_COLORS.act} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function PdcaChartsStatus({ phaseStats }: { phaseStats: PdcaPhaseStats[] }) {
  const data = phaseStats.map((s) => ({
    phase: PDCA_PHASE_META[s.phase].letter,
    label: PDCA_PHASE_META[s.phase].label,
    'À faire': s.todo,
    'En cours': s.inProgress,
    Terminé: s.done,
  }));

  return (
    <ChartCard title="Statuts par phase" subtitle="À faire · En cours · Terminé">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis dataKey="phase" tick={{ fill: '#57534e', fontSize: 13, fontWeight: 700 }} />
          <YAxis tick={{ fill: '#78716c', fontSize: 11 }} />
          <Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ''} />
          <Legend />
          <Bar dataKey="À faire" stackId="s" fill="#94a3b8" radius={[0, 0, 0, 0]} />
          <Bar dataKey="En cours" stackId="s" fill="#f59e0b" />
          <Bar dataKey="Terminé" stackId="s" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-semibold text-stone-900">{title}</h3>
        <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

export function PdcaCycleDiagram({ phaseStats }: { phaseStats: PdcaPhaseStats[] }) {
  const phases: PdcaPhase[] = ['plan', 'do', 'check', 'act'];
  return (
    <div className="relative flex flex-wrap items-center justify-center gap-3 sm:gap-6 py-6">
      {phases.map((phase, idx) => {
        const meta = PDCA_PHASE_META[phase];
        const stat = phaseStats.find((s) => s.phase === phase);
        return (
          <div key={phase} className="flex items-center gap-3 sm:gap-6">
            <div
              className={`relative flex flex-col items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 bg-gradient-to-br ${meta.gradient} text-white shadow-lg`}
              style={{ borderColor: meta.color }}
            >
              <span className="text-3xl sm:text-4xl font-black">{meta.letter}</span>
              <span className="text-[10px] sm:text-xs font-semibold opacity-90">{meta.label}</span>
              <span className="absolute -bottom-1 -right-1 min-w-[1.75rem] h-7 px-1.5 rounded-full bg-white text-stone-900 text-xs font-bold flex items-center justify-center shadow border border-stone-200">
                {stat?.total ?? 0}
              </span>
            </div>
            {idx < phases.length - 1 ? (
              <span className="hidden sm:block text-stone-300 text-2xl font-light">→</span>
            ) : (
              <span className="hidden sm:block text-stone-300 text-xl font-light rotate-90 sm:rotate-0">↻</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
