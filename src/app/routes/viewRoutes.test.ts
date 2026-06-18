import { describe, it, expect } from 'vitest';
import {
  APP_ROUTES,
  DEFAULT_VIEW,
  LOGIN_PATH,
  getRoutePath,
  getViewFromPathname,
  isAppRoutePath,
} from './viewRoutes';

describe('viewRoutes', () => {
  it('expose une route pour chaque vue principale', () => {
    expect(APP_ROUTES.length).toBeGreaterThanOrEqual(15);
    const ids = new Set(APP_ROUTES.map((r) => r.id));
    expect(ids.has('audit')).toBe(true);
    expect(ids.has('tasks')).toBe(true);
    expect(ids.has('documentation')).toBe(true);
  });

  it('getRoutePath retourne le chemin de la vue', () => {
    expect(getRoutePath('audit')).toBe('audit');
    expect(getRoutePath('my-dashboard')).toBe('mon-tableau-de-bord');
  });

  it('getViewFromPathname résout les segments URL', () => {
    expect(getViewFromPathname('/audit')).toBe('audit');
    expect(getViewFromPathname('/taches')).toBe('tasks');
    expect(getViewFromPathname('/')).toBe(DEFAULT_VIEW);
    expect(getViewFromPathname('/inconnu')).toBeNull();
  });

  it('isAppRoutePath distingue routes app et autres', () => {
    expect(isAppRoutePath('/budget')).toBe(true);
    expect(isAppRoutePath('/')).toBe(true);
    expect(isAppRoutePath('/connexion')).toBe(false);
  });

  it('LOGIN_PATH est /connexion', () => {
    expect(LOGIN_PATH).toBe('/connexion');
  });
});
