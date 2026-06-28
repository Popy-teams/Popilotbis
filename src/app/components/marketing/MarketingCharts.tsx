import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MarketingAction } from '../../types/marketing';
import { COST_EVOLUTION, MARKETING_KPIS } from '../../data/marketingDemoData';
import { computeActionStats } from './marketingPresentation';

interface MarketingChartsProps {
  actions: MarketingAction[];
}

export function MarketingCharts({ actions }: MarketingChartsProps) {
  const stats = computeActionStats(actions);

  const statusData = [
    { name: 'Planifiées', count: stats.planned, fill: '#78716c' },
    { name: 'En cours', count: stats.inProgress, fill: '#7c3aed' },
    { name: 'Terminées', count: stats.done, fill: '#059669' },
  ];

  const costLine = COST_EVOLUTION.map((p) => ({
    phase: p.phase,
    cout: p.unitCost,
    prix: p.sellingPrice ?? null,
  }));

  const costBar = COST_EVOLUTION.map((p) => ({
    phase: p.phase,
    cout: p.unitCost,
    fill: '#f97316',
  }));

  return (
    <div className="space-y-5 min-w-0">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4">
        {MARKETING_KPIS.map((kpi) => (
          <div key={kpi.id} className="rounded-2xl border border-stone-200/90 bg-white overflow-hidden shadow-sm min-w-0">
            <div className={`h-1 bg-gradient-to-r ${kpi.gradient}`} />
            <div className="p-4">
              <p className="text-xs text-stone-500 break-words">{kpi.label}</p>
              <p className="text-lg sm:text-xl font-bold text-stone-900 mt-1 break-words">{kpi.value}</p>
              <p
                className={`text-xs mt-1 break-words ${
                  kpi.trend === 'up' ? 'text-emerald-600' : kpi.trend === 'down' ? 'text-orange-600' : 'text-stone-500'
                }`}
              >
                {kpi.evolution}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ChartCard title="Évolution coût / prix" subtitle="Roadmap industrielle 5 ans">
          <ChartScrollPanel heightClass="h-[220px] sm:h-[260px]">
            <LineChart data={costLine}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="phase" tick={{ fill: '#78716c', fontSize: 10 }} interval={0} />
              <YAxis tick={{ fill: '#78716c', fontSize: 10 }} width={44} unit=" €" />
              <Tooltip formatter={(v: number) => [`${v} €`, '']} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="cout" name="Coût unitaire" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="prix" name="Prix vente" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
            </LineChart>
          </ChartScrollPanel>
        </ChartCard>

        <ChartCard title="Coût unitaire par phase" subtitle="Réduction progressive (-79%)">
          <ChartScrollPanel heightClass="h-[220px] sm:h-[260px]">
            <BarChart data={costBar}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="phase" tick={{ fill: '#78716c', fontSize: 10 }} interval={0} />
              <YAxis tick={{ fill: '#78716c', fontSize: 10 }} width={44} unit=" €" />
              <Tooltip formatter={(v: number) => [`${v} €`, 'Coût']} />
              <Bar dataKey="cout" name="Coût unitaire" radius={[6, 6, 0, 0]}>
                {costBar.map((entry) => (
                  <Cell key={entry.phase} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartScrollPanel>
        </ChartCard>
      </div>

      <ChartCard title="Pipeline actions marketing" subtitle={`${stats.total} action(s) au total`}>
        <ChartScrollPanel heightClass="h-[180px] sm:h-[220px]">
          <BarChart data={statusData} layout="vertical" margin={{ left: 0, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#78716c', fontSize: 10 }} />
            <YAxis type="category" dataKey="name" width={64} tick={{ fill: '#78716c', fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="count" name="Actions" radius={[0, 6, 6, 0]}>
              {statusData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartScrollPanel>
      </ChartCard>
    </div>
  );
}

function ChartScrollPanel({
  children,
  heightClass,
}: {
  children: React.ReactElement;
  heightClass: string;
}) {
  return (
    <div className={`w-full min-w-0 ${heightClass}`}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
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
    <section className="rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-sm min-w-0">
      <div className="mb-3">
        <h3 className="font-semibold text-stone-900 text-sm sm:text-base">{title}</h3>
        <p className="text-xs sm:text-sm text-stone-500">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}
