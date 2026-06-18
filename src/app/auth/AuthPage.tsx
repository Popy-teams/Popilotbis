import { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  Shield,
  Award,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { forgotPasswordRequest } from './authApi';
import { AppIcon, ActionButton } from '../components/shared';

type AuthMode = 'login' | 'register' | 'forgot';

const FEATURES = [
  { icon: BarChart3, label: 'Pilotage projet en temps réel' },
  { icon: Shield, label: 'Conformité ISO 9001 intégrée' },
  { icon: CheckCircle2, label: 'Traçabilité décisions & actions' },
];

export function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'register') {
        await register(email, password, name);
      } else {
        const message = await forgotPasswordRequest(email);
        setInfo(message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSubmitting(false);
    }
  };

  const title =
    mode === 'login'
      ? 'Bon retour parmi nous'
      : mode === 'register'
      ? 'Créez votre espace Popilot'
      : 'Réinitialiser le mot de passe';

  const subtitle =
    mode === 'login'
      ? 'Connectez-vous pour accéder à vos projets, risques et documentation qualité.'
      : mode === 'register'
      ? 'Rejoignez votre équipe et centralisez le pilotage de vos projets.'
      : 'Indiquez votre email — nous vous enverrons un lien sécurisé.';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      {/* Panneau visuel */}
      <aside className="relative hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col justify-between overflow-hidden bg-white">
        <div className="absolute inset-0 bg-white">
          <div className="flex h-full w-full items-center justify-center bg-white">
            <img
              src="/images/15.jpg?v=4"
              alt="Illustration Popilot"
              className="block h-full w-full object-contain object-center"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 via-indigo-900/75 to-slate-900/85" />
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
        </div>

        <div className="relative z-10 p-10 xl:p-14">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
              <AppIcon icon={Shield} size="md" className="text-white" />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight text-white">Popilot</p>
              <p className="text-xs text-indigo-200/90">ISO 9001 Certified</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-10 xl:p-14 space-y-8">
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-indigo-100 backdrop-blur-sm mb-5">
              <AppIcon icon={Sparkles} size="xs" className="text-amber-300" />
              Plateforme de pilotage nouvelle génération
            </div>
            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight tracking-tight">
              Pilotez vos projets avec rigueur et sérénité
            </h2>
            <p className="mt-4 text-base text-indigo-100/90 leading-relaxed">
              Vision, décisions, exécution — Popilot relie chaque action à votre système qualité
              pour une conformité ISO continue, pas un audit de dernière minute.
            </p>
          </div>

          <ul className="space-y-3">
            {FEATURES.map(({ icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/30">
                  <AppIcon icon={icon} size="sm" className="text-indigo-100" />
                </span>
                <span className="text-sm font-medium text-white/95">{label}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 backdrop-blur-sm">
            <AppIcon icon={Award} size="md" className="text-emerald-300 shrink-0" />
            <p className="text-sm text-emerald-50">
              <span className="font-semibold">ISO 9001</span> — registre risques, documentation et
              audit en temps réel
            </p>
          </div>
        </div>

        <div className="relative z-10 px-10 xl:px-14 pb-8">
          <p className="text-xs text-indigo-300/70">© {new Date().getFullYear()} Popilot — Tous droits réservés</p>
        </div>
      </aside>

      {/* Formulaire */}
      <main className="flex flex-1 flex-col justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* En-tête mobile */}
          <div className="mb-8 lg:hidden text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 shadow-lg shadow-indigo-500/25">
              <AppIcon icon={Shield} size="lg" className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Popilot</h1>
            <p className="text-sm text-slate-500 mt-1">Pilotage projet ISO 9001</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">{subtitle}</p>
            </div>

            {mode !== 'forgot' && (
              <div className="mb-6 flex gap-1 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setInfo(null);
                  }}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                    mode === 'login'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Connexion
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                    setInfo(null);
                  }}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                    mode === 'register'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Inscription
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'register' && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nom complet
                  </label>
                  <div className="relative">
                    <AppIcon
                      icon={User}
                      size="sm"
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      id="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                      placeholder="Jean Dupont"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Adresse email
                </label>
                <div className="relative">
                  <AppIcon
                    icon={Mail}
                    size="sm"
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    id="email"
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                    placeholder="vous@entreprise.com"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                      Mot de passe
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setError(null);
                          setInfo(null);
                        }}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        Oublié ?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <AppIcon
                      icon={Lock}
                      size="sm"
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      id="password"
                      required
                      type="password"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                      placeholder="8 caractères minimum"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {info && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {info}
                </div>
              )}

              <ActionButton
                type="submit"
                icon={mode === 'forgot' ? Mail : ArrowRight}
                className="w-full !py-3 !rounded-xl !text-base !font-semibold shadow-lg shadow-indigo-500/20"
              >
                {submitting
                  ? 'Chargement...'
                  : mode === 'login'
                  ? 'Se connecter'
                  : mode === 'register'
                  ? 'Créer mon compte'
                  : 'Envoyer le lien'}
              </ActionButton>
            </form>

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setInfo(null);
                }}
                className="mt-5 w-full text-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                ← Retour à la connexion
              </button>
            )}

            {mode === 'login' && (
              <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3">
                <p className="text-xs font-medium text-slate-500 mb-1">Compte de démonstration</p>
                <p className="text-xs text-slate-600 font-mono">
                  admin@popilot.com · Popilot2026!
                </p>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-slate-400 lg:hidden">
            Pilotage projet · Qualité ISO · Équipe
          </p>
        </div>
      </main>
    </div>
  );
}
