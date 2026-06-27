import type { TestTask } from '../data/testData';

export interface MemberTaskRef {
  id: string;
  tasksUserId?: string;
}

function resolveAssigneeIds(member: MemberTaskRef): string[] {
  return member.tasksUserId ? [member.id, member.tasksUserId] : [member.id];
}

/** Charge relative à la moyenne du projet : 100 % = charge moyenne */
export function computeMemberWorkloads(
  tasks: TestTask[],
  members: MemberTaskRef[]
): Record<string, number> {
  if (members.length === 0) return {};

  const counts = members.map((member) => {
    const ids = resolveAssigneeIds(member);
    return tasks.filter((t) => ids.includes(t.assignedTo) && t.status !== 'done').length;
  });
  const total = counts.reduce((sum, n) => sum + n, 0);
  const average = total / members.length;

  if (average === 0) {
    return Object.fromEntries(members.map((m) => [m.id, 0]));
  }

  return Object.fromEntries(
    members.map((member, index) => [member.id, Math.round((counts[index] / average) * 100)])
  );
}

export function countAssignedTasks(tasks: TestTask[], member: MemberTaskRef): number {
  const ids = resolveAssigneeIds(member);
  return tasks.filter((t) => ids.includes(t.assignedTo)).length;
}

export function workloadLabel(workload: number): 'Disponible' | 'Surchargé' | 'En congé' {
  if (workload >= 130) return 'Surchargé';
  return 'Disponible';
}

export function workloadColorClass(workload: number): string {
  if (workload >= 130) return 'text-red-600 bg-red-100';
  if (workload >= 100) return 'text-amber-600 bg-amber-100';
  return 'text-emerald-600 bg-emerald-100';
}

export function workloadBarClass(workload: number): string {
  if (workload >= 130) return 'bg-red-500';
  if (workload >= 100) return 'bg-amber-500';
  return 'bg-emerald-500';
}
