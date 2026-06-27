import { createContext, useContext } from 'react';

/** true à l'intérieur d'un ViewHero / bannière sombre */
export const HeroSurfaceContext = createContext(false);

export function useHeroSurface() {
  return useContext(HeroSurfaceContext);
}

/** Classes boutons lisibles sur bannière hero (contraste WCAG) */
export const heroButtonStyles = {
  primary:
    'bg-white text-slate-900 hover:bg-white/90 shadow-md shadow-black/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
  secondary:
    'border border-white/40 bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
  danger:
    'border border-red-300/50 bg-red-500/25 text-white hover:bg-red-500/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
} as const;

export const actionButtonBaseClass =
  'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors w-full sm:w-auto disabled:opacity-50 disabled:pointer-events-none';
