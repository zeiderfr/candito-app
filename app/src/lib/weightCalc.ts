/** Arrondi à la plaque 2.5 kg la plus proche */
export function calcWeight(rm: number, pct: number): number {
  if (!rm) return 0
  return Math.round((rm * pct) / 2.5) * 2.5
}
