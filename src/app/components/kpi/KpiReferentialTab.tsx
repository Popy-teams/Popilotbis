import { KPI_CATEGORIES, KPI_REFERENTIAL, KPI_REFERENTIAL_INTRO } from '../../data/kpiReferential';
import { TableWrap } from '../shared';
import { CATEGORY_ICONS } from './kpiPresentation';

export function KpiReferentialTab() {
  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
        <h3 className="font-semibold text-stone-900 mb-2 text-sm sm:text-base">
          Référentiel des KPI — Projet POPY
        </h3>
        <p className="text-sm text-stone-800 leading-relaxed">{KPI_REFERENTIAL_INTRO}</p>
        <p className="text-xs text-stone-600 mt-3 font-medium">
          {KPI_REFERENTIAL.length} indicateurs · {KPI_CATEGORIES.length} familles
        </p>
      </div>

      {KPI_CATEGORIES.map((category) => {
        const rows = KPI_REFERENTIAL.filter((k) => k.categoryId === category.id);
        const Icon = CATEGORY_ICONS[category.id];

        return (
          <section
            key={category.id}
            className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden min-w-0"
          >
            <div className="flex items-start gap-3 px-3 sm:px-4 py-3 border-b border-stone-100 bg-stone-50">
              <Icon className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h3 className="font-semibold text-stone-900 text-sm sm:text-base leading-snug">
                  {category.name}
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">{category.description}</p>
              </div>
            </div>

            {/* Mobile : cartes empilées */}
            <div className="md:hidden divide-y divide-stone-100">
              {rows.map((row) => (
                <article key={row.id} className="p-3 sm:p-4 space-y-2">
                  <h4 className="font-semibold text-stone-900 text-sm leading-snug">{row.name}</h4>
                  <dl className="space-y-1.5 text-xs">
                    <div>
                      <dt className="font-medium text-stone-500">Objectif</dt>
                      <dd className="text-stone-800 mt-0.5">{row.objective}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-stone-500">Méthode de mesure</dt>
                      <dd className="text-stone-800 mt-0.5">{row.measurementMethod}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-stone-500">Responsable</dt>
                      <dd className="text-stone-800 mt-0.5">{row.responsible}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-stone-500">Seuil cible</dt>
                      <dd className="mt-1">
                        <span className="inline-flex px-2 py-1 rounded-md bg-amber-100 text-amber-950 text-xs font-semibold">
                          {row.targetThreshold}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>

            {/* Desktop : tableau */}
            <div className="hidden md:block">
              <TableWrap>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-600">
                      <th className="px-4 py-3 font-semibold min-w-[140px]">KPI</th>
                      <th className="px-4 py-3 font-semibold min-w-[120px]">Objectif</th>
                      <th className="px-4 py-3 font-semibold min-w-[160px]">Méthode de mesure</th>
                      <th className="px-4 py-3 font-semibold min-w-[120px] hidden lg:table-cell">
                        Responsable
                      </th>
                      <th className="px-4 py-3 font-semibold min-w-[100px]">Seuil cible</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-b border-stone-100 hover:bg-amber-50/50">
                        <td className="px-4 py-3 font-medium text-stone-900">{row.name}</td>
                        <td className="px-4 py-3 text-stone-800">{row.objective}</td>
                        <td className="px-4 py-3 text-stone-800">{row.measurementMethod}</td>
                        <td className="px-4 py-3 text-stone-800 hidden lg:table-cell">{row.responsible}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 text-xs font-semibold">
                            {row.targetThreshold}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            </div>
          </section>
        );
      })}
    </div>
  );
}
