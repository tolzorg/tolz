// PDF page geometry uses points (72 per inch); our layout is defined in mm.
export function mmToPt(mm) {
  return (mm / 25.4) * 72;
}
