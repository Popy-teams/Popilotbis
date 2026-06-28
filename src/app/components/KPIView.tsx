import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Target, Users, FileCheck, Activity, BarChart3, ArrowUpRight, ArrowDownRight, Minus, Clock, Award, Plus, Bot, Eye, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PageBackHeader } from './shared/PageBackHeader';
import { ViewShell, ViewHeader, viewGrids, TableWrap, AppIcon, IconButton, ActionButton } from './shared';
import { useProjectContext } from '../context/ProjectContext';

interface KPI {
  id: string;
  name: string;
  category: string;
  currentValue: number;
  targetValue: number;
  previousValue: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  responsible: string;
  description: string;
}

const ALL_KPIS: KPI[] = [
  // Avancement & Délais
  {
    id: 'kpi-adv-1',
    name: 'Avancement Global',
    category: 'Avancement & Délais',
    currentValue: 68,
    targetValue: 75,
    previousValue: 65,
    unit: '%',
    status: 'warning',
    trend: 'up',
    responsible: 'Chef de projet',
    description: 'Tâches réalisées / Tâches planifiées'
  },
  {
    id: 'kpi-adv-2',
    name: 'Respect des Jalons',
    category: 'Avancement & Délais',
    currentValue: 85,
    targetValue: 100,
    previousValue: 82,
    unit: '%',
    status: 'good',
    trend: 'up',
    responsible: 'Chef de projet',
    description: 'Jalons validés dans les délais'
  },
  {
    id: 'kpi-adv-3',
    name: 'Retard Tâches Critiques',
    category: 'Avancement & Délais',
    currentValue: 15,
    targetValue: 10,
    previousValue: 18,
    unit: '%',
    status: 'warning',
    trend: 'down',
    responsible: 'Chef de projet',
    description: 'Tâches critiques en retard'
  },
  {
    id: 'kpi-adv-4',
    name: 'Écart Planning',
    category: 'Avancement & Délais',
    currentValue: 3,
    targetValue: 0,
    previousValue: 2,
    unit: 'jours',
    status: 'warning',
    trend: 'up',
    responsible: 'Chef de projet',
    description: 'Jours réels vs jours prévus'
  },
  // Qualité & Conformité
  {
    id: 'kpi-qual-1',
    name: 'Livrables Validés',
    category: 'Qualité & Conformité',
    currentValue: 92,
    targetValue: 95,
    previousValue: 88,
    unit: '%',
    status: 'good',
    trend: 'up',
    responsible: 'Resp. Qualité',
    description: 'Livrables acceptés sans correction'
  },
  {
    id: 'kpi-qual-2',
    name: 'Non-Conformités',
    category: 'Qualité & Conformité',
    currentValue: 8,
    targetValue: 5,
    previousValue: 12,
    unit: 'NC',
    status: 'warning',
    trend: 'down',
    responsible: 'Resp. Qualité',
    description: 'Écarts détectés lors des revues'
  },
  {
    id: 'kpi-qual-3',
    name: 'Taux Correction NC',
    category: 'Qualité & Conformité',
    currentValue: 87,
    targetValue: 90,
    previousValue: 85,
    unit: '%',
    status: 'warning',
    trend: 'up',
    responsible: 'Resp. Qualité',
    description: 'NC corrigées / NC détectées'
  },
  {
    id: 'kpi-qual-4',
    name: 'Couverture Exigences',
    category: 'Qualité & Conformité',
    currentValue: 78,
    targetValue: 100,
    previousValue: 72,
    unit: '%',
    status: 'warning',
    trend: 'up',
    responsible: 'Ingé. système',
    description: 'Exigences couvertes par tests'
  },
  // Technique Prototype
  {
    id: 'kpi-tech-1',
    name: 'Fonctionnalités Opérationnelles',
    category: 'Technique Prototype',
    currentValue: 72,
    targetValue: 80,
    previousValue: 68,
    unit: '%',
    status: 'warning',
    trend: 'up',
    responsible: 'Lead technique',
    description: 'Fonctions implémentées et testées'
  },
  {
    id: 'kpi-tech-2',
    name: 'Stabilité Système',
    category: 'Technique Prototype',
    currentValue: 12,
    targetValue: 5,
    previousValue: 15,
    unit: 'incidents',
    status: 'critical',
    trend: 'down',
    responsible: 'Log. embarqué',
    description: 'Crashs / dysfonctionnements'
  },
  {
    id: 'kpi-tech-3',
    name: 'Autonomie Batterie',
    category: 'Technique Prototype',
    currentValue: 4.2,
    targetValue: 6.0,
    previousValue: 3.8,
    unit: 'heures',
    status: 'warning',
    trend: 'up',
    responsible: 'Hardware',
    description: 'Durée de fonctionnement robot'
  },
  {
    id: 'kpi-tech-4',
    name: 'Temps de Réponse',
    category: 'Technique Prototype',
    currentValue: 320,
    targetValue: 200,
    previousValue: 380,
    unit: 'ms',
    status: 'warning',
    trend: 'down',
    responsible: 'IA / Logiciel',
    description: 'Latence entrée-réponse'
  },
  // Organisation Équipe
  {
    id: 'kpi-org-1',
    name: 'Tâches en Retard',
    category: 'Organisation Équipe',
    currentValue: 18,
    targetValue: 10,
    previousValue: 18,
    unit: '%',
    status: 'warning',
    trend: 'stable',
    responsible: 'Chef de projet',
    description: 'Charge mal maîtrisée'
  },
  {
    id: 'kpi-org-2',
    name: 'Écart Charge',
    category: 'Organisation Équipe',
    currentValue: 15,
    targetValue: 0,
    previousValue: 22,
    unit: 'heures',
    status: 'warning',
    trend: 'down',
    responsible: 'Chef de projet',
    description: 'Heures réelles vs prévues'
  },
  {
    id: 'kpi-org-3',
    name: 'Participation Équipe',
    category: 'Organisation Équipe',
    currentValue: 94,
    targetValue: 95,
    previousValue: 94,
    unit: '%',
    status: 'good',
    trend: 'stable',
    responsible: 'PO',
    description: 'Tâches mises à jour dans POPILOT'
  },
  // Documentation
  {
    id: 'kpi-doc-1',
    name: 'Complétude Documentaire',
    category: 'Documentation',
    currentValue: 82,
    targetValue: 100,
    previousValue: 76,
    unit: '%',
    status: 'warning',
    trend: 'up',
    responsible: 'Qualité',
    description: 'Documents validés / attendus'
  },
  {
    id: 'kpi-doc-2',
    name: 'Traçabilité Exigences',
    category: 'Documentation',
    currentValue: 76,
    targetValue: 100,
    previousValue: 68,
    unit: '%',
    status: 'warning',
    trend: 'up',
    responsible: 'Ingé. système',
    description: 'Exigences tracées vers tests'
  },
  {
    id: 'kpi-doc-3',
    name: 'Validation Documentaire',
    category: 'Documentation',
    currentValue: 88,
    targetValue: 95,
    previousValue: 88,
    unit: '%',
    status: 'good',
    trend: 'stable',
    responsible: 'Qualité',
    description: 'Docs acceptés sans rework'
  }
];

type KpiPageMode = 'list' | 'create' | 'view' | 'edit';

const emptyKpiForm = {
  name: '',
  category: 'Avancement & Délais',
  currentValue: 0,
  targetValue: 100,
  previousValue: 0,
  unit: '%',
  status: 'warning' as KPI['status'],
  trend: 'stable' as KPI['trend'],
  responsible: '',
  description: '',
};

export function KPIView() {
  const { activeProject, matchesProject } = useProjectContext();
  const showKpis = matchesProject('popy');
  const [pageMode, setPageMode] = useState<KpiPageMode>('list');
  const [kpis, setKpis] = useState<KPI[]>(ALL_KPIS);
  const [selectedKpi, setSelectedKpi] = useState<KPI | null>(null);
  const [form, setForm] = useState(emptyKpiForm);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('popilot:kpi-local');
      if (raw) setKpis(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('popilot:kpi-local', JSON.stringify(kpis));
    } catch {}
  }, [kpis]);

  const toKpi = (base?: KPI): KPI => ({
    id: base?.id ?? `kpi-${Date.now()}`,
    name: form.name,
    category: form.category,
    currentValue: form.currentValue,
    targetValue: form.targetValue,
    previousValue: form.previousValue,
    unit: form.unit,
    status: form.status,
    trend: form.trend,
    responsible: form.responsible,
    description: form.description,
  });

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const next = toKpi(pageMode === 'edit' ? selectedKpi ?? undefined : undefined);
    if (pageMode === 'create') setKpis((prev) => [...prev, next]);
    else {
      setKpis((prev) => prev.map((k) => (k.id === next.id ? next : k)));
      setSelectedKpi(next);
    }
    setPageMode('list');
    setForm(emptyKpiForm);
  };

  const removeKpi = (id: string) => {
    setKpis((prev) => prev.filter((k) => k.id !== id));
    setSelectedKpi(null);
    setPageMode('list');
  };

  const openCreate = () => { setForm(emptyKpiForm); setSelectedKpi(null); setPageMode('create'); };
  const openView = (kpi: KPI) => { setSelectedKpi(kpi); setPageMode('view'); };
  const openEdit = (kpi: KPI) => {
    setSelectedKpi(kpi);
    setForm({ name: kpi.name, category: kpi.category, currentValue: kpi.currentValue, targetValue: kpi.targetValue, previousValue: kpi.previousValue, unit: kpi.unit, status: kpi.status, trend: kpi.trend, responsible: kpi.responsible, description: kpi.description });
    setPageMode('edit');
  };

  const kpiFormPage = (
    <ViewShell narrow>
      <PageBackHeader title={pageMode === 'create' ? 'Nouveau KPI' : 'Modifier le KPI'} onBack={() => setPageMode(selectedKpi ? 'view' : 'list')} />
      <form onSubmit={submitForm} className="bg-white rounded-xl border p-6 space-y-4 shadow-sm">
        <input required placeholder="Nom du KPI" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
          {['Avancement & Délais', 'Qualité & Conformité', 'Technique Prototype', 'Organisation Équipe', 'Documentation'].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className={viewGrids.stats3}>
          <input type="number" placeholder="Valeur actuelle" value={form.currentValue} onChange={(e) => setForm({ ...form, currentValue: Number(e.target.value) })} className="px-4 py-2 border rounded-lg" />
          <input type="number" placeholder="Cible" value={form.targetValue} onChange={(e) => setForm({ ...form, targetValue: Number(e.target.value) })} className="px-4 py-2 border rounded-lg" />
          <input placeholder="Unité" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="px-4 py-2 border rounded-lg" />
        </div>
        <input placeholder="Responsable" value={form.responsible} onChange={(e) => setForm({ ...form, responsible: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg" rows={3} />
        <div className="flex gap-3">
          <button type="button" onClick={() => setPageMode(selectedKpi ? 'view' : 'list')} className="flex-1 px-4 py-2 border rounded-lg">Annuler</button>
          <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">{pageMode === 'create' ? 'Créer' : 'Enregistrer'}</button>
        </div>
      </form>
    </ViewShell>
  );

  if (pageMode === 'create' || pageMode === 'edit') return kpiFormPage;

  if (pageMode === 'view' && selectedKpi) {
    const kpi = kpis.find((k) => k.id === selectedKpi.id) ?? selectedKpi;
    return (
      <ViewShell narrow>
        <PageBackHeader title={kpi.name} subtitle={kpi.category} onBack={() => { setPageMode('list'); setSelectedKpi(null); }}
          actions={<div className="flex gap-2">
            <button type="button" onClick={() => openEdit(kpi)} className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg"><Pencil className="w-4 h-4" /> Modifier</button>
            <button type="button" onClick={() => removeKpi(kpi.id)} className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-700 rounded-lg"><Trash2 className="w-4 h-4" /> Supprimer</button>
          </div>}
        />
        <Card><CardContent className="p-6 space-y-3">
          <p className="text-gray-600">{kpi.description}</p>
          <div className="text-3xl font-bold">{kpi.currentValue} {kpi.unit} <span className="text-lg text-gray-500">/ cible {kpi.targetValue}</span></div>
          <p className="text-sm">Responsable : {kpi.responsible}</p>
        </CardContent></Card>
      </ViewShell>
    );
  }

  const globalStats = {
    good: kpis.filter(k => k.status === 'good').length,
    warning: kpis.filter(k => k.status === 'warning').length,
    critical: kpis.filter(k => k.status === 'critical').length,
    total: kpis.length
  };

  const healthScore = Math.round(
    ((globalStats.good * 100) + (globalStats.warning * 50) + (globalStats.critical * 0)) / globalStats.total
  );

  const categories = [
    { name: 'Avancement & Délais', icon: Target, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50' },
    { name: 'Qualité & Conformité', icon: CheckCircle, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50' },
    { name: 'Technique Prototype', icon: Activity, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50' },
    { name: 'Organisation Équipe', icon: Users, color: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-50' },
    { name: 'Documentation', icon: FileCheck, color: 'from-cyan-500 to-cyan-600', bgColor: 'bg-cyan-50' }
  ];

  const getStatusBadge = (status: string) => {
    const configs = {
      good: { label: 'Conforme', className: 'bg-green-500 text-white' },
      warning: { label: 'Surveillance', className: 'bg-orange-500 text-white' },
      critical: { label: 'Action requise', className: 'bg-red-500 text-white' }
    };
    const config = configs[status as keyof typeof configs];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getTrendBadge = (trend: string, currentValue: number, previousValue: number) => {
    const change = currentValue - previousValue;
    const changePercent = previousValue !== 0 ? Math.abs((change / previousValue) * 100).toFixed(1) : '0';
    
    if (trend === 'up') {
      return (
        <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
          <ArrowUpRight className="w-4 h-4" />
          <span>+{changePercent}%</span>
        </div>
      );
    } else if (trend === 'down') {
      return (
        <div className="flex items-center gap-1 text-red-600 text-sm font-semibold">
          <ArrowDownRight className="w-4 h-4" />
          <span>-{changePercent}%</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-gray-500 text-sm">
        <Minus className="w-4 h-4" />
        <span>0%</span>
      </div>
    );
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-orange-500 to-amber-600';
    return 'from-red-500 to-rose-600';
  };

  return (
    <div className="h-full overflow-auto">
      <ViewShell>
        <ViewHeader
          title="Tableau de bord KPI"
          subtitle={
            activeProject
              ? `${activeProject.name} — Dernière mise à jour : 24 février 2026`
              : 'Sélectionnez un projet — Dernière mise à jour : 24 février 2026'
          }
          badge="Indicateurs · KPI"
          theme="amber"
          actions={
            <ActionButton icon={Plus} onClick={openCreate}>Nouveau KPI</ActionButton>
          }
        />

        {!showKpis ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-stone-600">
            Aucun indicateur KPI configuré pour ce projet. Les KPI de démonstration sont liés au projet POPY.
          </div>
        ) : (
        <>
        {/* Métriques principales */}
        <div className={viewGrids.stats4}>
          {/* Score global de santé */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-medium text-gray-300">Score Global Projet</span>
              </div>
              <div className="text-5xl font-bold mb-2">{healthScore}<span className="text-2xl text-gray-400">/100</span></div>
              <Progress value={healthScore} className="h-3 bg-slate-700" />
              <p className="text-xs text-gray-400 mt-3">Indicateur de santé globale ISO 9001</p>
            </CardContent>
          </Card>

          {/* KPI Conformes */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-green-100 text-green-700">+12%</Badge>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">{globalStats.good}</div>
              <p className="text-sm text-gray-600">KPI Conformes</p>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Objectif atteint</span>
                  <span className="font-semibold text-green-600">{Math.round((globalStats.good / globalStats.total) * 100)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI À surveiller */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-orange-100 text-orange-700">-5%</Badge>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">{globalStats.warning}</div>
              <p className="text-sm text-gray-600">KPI À Surveiller</p>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Écart à la cible</span>
                  <span className="font-semibold text-orange-600">{Math.round((globalStats.warning / globalStats.total) * 100)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI Critiques */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-600">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-red-100 text-red-700">Action</Badge>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">{globalStats.critical}</div>
              <p className="text-sm text-gray-600">Action Requise</p>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Dérive importante</span>
                  <span className="font-semibold text-red-600">{Math.round((globalStats.critical / globalStats.total) * 100)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPI par catégorie */}
        {categories.map((category) => {
          const categoryKPIs = kpis.filter(k => k.category === category.name);
          const Icon = category.icon;
          
          return (
            <div key={category.name} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
                <Badge variant="outline" className="ml-auto">{categoryKPIs.length} indicateurs</Badge>
              </div>
              
              <div className={viewGrids.stats4}>
                {categoryKPIs.map((kpi) => (
                  <Card key={kpi.id} className="hover:shadow-lg transition-all border-l-4 cursor-pointer" style={{ borderLeftColor: kpi.status === 'good' ? '#22c55e' : kpi.status === 'warning' ? '#f97316' : '#ef4444' }} onClick={() => openView(kpi)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm font-semibold text-gray-700">{kpi.name}</CardTitle>
                        {getStatusBadge(kpi.status)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{kpi.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="text-3xl font-bold text-gray-900">
                              {kpi.currentValue}
                              <span className="text-lg text-gray-500 ml-1">{kpi.unit}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Cible: {kpi.targetValue} {kpi.unit}
                            </div>
                          </div>
                          {getTrendBadge(kpi.trend, kpi.currentValue, kpi.previousValue)}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Progression</span>
                            <span className="font-semibold">
                              {kpi.unit === '%' 
                                ? `${kpi.currentValue}%` 
                                : `${Math.round((kpi.currentValue / kpi.targetValue) * 100)}%`
                              }
                            </span>
                          </div>
                          <Progress 
                            value={kpi.unit === '%' ? kpi.currentValue : (kpi.currentValue / kpi.targetValue) * 100} 
                            className="h-2"
                          />
                        </div>

                        <div className="pt-3 border-t flex items-center justify-between text-xs">
                          <span className="text-gray-500">Responsable</span>
                          <span className="font-medium text-gray-700">{kpi.responsible}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
        </>
        )}
      </ViewShell>
    </div>
  );
}