/** Fusionne des listes par id sans écraser les entrées déjà présentes. */
export function mergeDemoData<T extends { id: string | number }>(
  saved: T[],
  ...pools: T[][]
): T[] {
  let result = [...saved];
  for (const pool of pools) {
    const ids = new Set(result.map((item) => String(item.id)));
    result = [...result, ...pool.filter((item) => !ids.has(String(item.id)))];
  }
  return result;
}
