import { CheckCircle2, KeyRound, Mail, Shield, XCircle } from 'lucide-react';
import type { AuthUser } from '../../auth/authApi';
import type { PersonalStats } from './personalPresentation';

interface PersonalSecurityTabProps {
  user: AuthUser;
  stats: PersonalStats;
}

export function PersonalSecurityTab({ user, stats }: PersonalSecurityTabProps) {
  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl border border-stone-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Compte</h2>
          <p className="text-sm text-stone-500 mt-1">Informations de connexion gérées par l&apos;authentification POPILOT.</p>
        </div>
        <div className="space-y-3">
          <AccountRow icon={Mail} label="Adresse email" value={user.email} />
          <AccountRow icon={Shield} label="Rôle" value={stats.roleLabel} />
          <AccountRow icon={KeyRound} label="Membre depuis" value={stats.memberSince} />
          <div className="flex items-start gap-3 p-4 rounded-xl bg-stone-50 border border-stone-100">
            <div className="p-2 rounded-lg bg-white text-stone-600 shrink-0 border border-stone-200">
              {stats.emailVerified ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <XCircle className="w-4 h-4 text-amber-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900">Vérification email</p>
              <p className="text-xs text-stone-500 mt-0.5">
                {stats.emailVerified
                  ? 'Votre adresse email est vérifiée.'
                  : 'Un email de vérification vous sera envoyé prochainement.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-stone-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Mot de passe</h2>
          <p className="text-sm text-stone-500 mt-1">
            Pour modifier votre mot de passe, utilisez le lien « Mot de passe oublié » sur la page de connexion
            ou contactez votre administrateur.
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          La modification du mot de passe depuis l&apos;espace personnel sera disponible dans une prochaine version.
        </div>
      </section>

      <section className="bg-white rounded-xl border border-stone-200 p-4 sm:p-6 shadow-sm space-y-3">
        <h2 className="text-lg font-bold text-stone-900">Sessions actives</h2>
        <p className="text-sm text-stone-500">
          Vous êtes actuellement connecté sur cet appareil. La gestion multi-sessions arrive prochainement.
        </p>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          Session active — navigateur actuel
        </div>
      </section>
    </div>
  );
}

function AccountRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-stone-200 min-w-0">
      <div className="p-2 rounded-lg bg-sky-50 text-sky-700 shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide font-semibold text-stone-500">{label}</p>
        <p className="text-sm font-medium text-stone-900 mt-0.5 break-all">{value}</p>
      </div>
    </div>
  );
}
