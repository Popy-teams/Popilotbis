import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { Project } from '../../../types';

export function getStatusColor(status: string) {
  if (status === 'on-track') return 'saas-badge-success';
  if (status === 'at-risk') return 'saas-badge-warning';
  if (status === 'delayed') return 'saas-badge-danger';
  return 'saas-badge-neutral';
}

export function getStatusLabel(status: string) {
  if (status === 'on-track') return 'Dans les temps';
  if (status === 'at-risk') return 'A risque';
  if (status === 'delayed') return 'En retard';
  return 'Archive';
}

export function getPriorityBadge(priority: Project['priority']) {
  if (priority === 'high') return { label: 'Eleve', cls: 'saas-badge-danger', icon: AlertTriangle };
  if (priority === 'medium') return { label: 'Moyen', cls: 'saas-badge-warning', icon: ShieldCheck };
  return { label: 'Bas', cls: 'saas-badge-success', icon: ShieldCheck };
}
