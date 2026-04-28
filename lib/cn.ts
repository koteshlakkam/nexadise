/**
 * Lightweight className combiner — joins truthy strings with single spaces.
 * Avoids pulling in clsx/tailwind-merge as a dep.
 */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}
