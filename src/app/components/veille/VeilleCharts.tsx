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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { VeilleEntry } from '../../types/veille';
import { computeVeilleStats, VEILLE_TYPES } from './veillePresentation';

const TYPE_COLORS = ['#dc2626', '#2563eb', '#7c3aed', '#059669', '#ea580c', '#d97706', '#4f46e5'];
const STATUS_COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#78716c'];

interface VeilleChartsProps {
  entries: VeilleEntry[];
}

export function VeilleCharts({ entries }: VeilleChartsProps) {
  const stats = computeVeilleStats(entries);

  const pieType = stats.byType.filter((t) => t.count > 0).map((t, i) => ({
    name: t.label.split(' ')[0],
    value: t.count,
    fill: TYPE_COLORS[i % TYPE_COLORS.length],
  }));

  const barStatus = stats.byStatus.map((s, i) => ({
    name: s.label,
    count: s.count,
    fill: STATUS_COLORS[i],
  }));

  const trend = ['Sept', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév'].map((month, idx) => ({
    month,
    signaux: [2, 3, 2, 4, 5, entries.length][idx] ?? entries.length,
    actions: [1, 1, 2, 2, 3, stats.actionRequired][idx],
  }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ChartCard title="Répartition par type" subtitle="7 axes de veille ISO">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieType} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={88} paddingAngle={2}>
                {pieType.map((entry, i) => (
                  <Cell key={entry.name} fill={entry.fill ?? TYPE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v} entrée(s)`, 'Volume']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Statuts du registre" subtitle="Pipeline de traitement">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="name" tick={{ fill: '#78716c', fontSize: 10 }} />
              <YAxis tick={{ fill: '#78716c', fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name="Entrées" radius={[6, 6, 0, 0]}>
                {barStatus.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Évolution des signaux" subtitle="6 derniers mois — détection vs actions requises">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
            <XAxis dataKey="month" tick={{ fill: '#78716c', fontSize: 12 }} />
            <YAxis tick={{ fill: '#78716c', fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="signaux" name="Signaux détectés" stroke="#0891b2" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="actions" name="Actions requises" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Couverture par type ISO" subtitle="Objectif : au moins 1 entrée par axe">
        <div className="space-y-3">
          {VEILLE_TYPES.map((t, i) => {
            const count = entries.filter((e) => e.type === t.id).length;
            const pct = entries.length === 0 ? 0 : Math.min(100, (count / Math.max(1, entries.length)) * 100 * 3);
            return (
              <div key={t.id} className="flex items-center gap-3">
                <span className="w-36 text-xs font-medium text-stone-700 truncate">{t.label}</span>
                <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: TYPE_COLORS[i] }} />
                </div>
                <span className="w-6 text-sm font-bold text-stone-800 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
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
