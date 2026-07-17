export interface WarDayInfo {
  periodDay: number;
  expectedType: 'training' | 'warDay';
}

// Lun/Mar/Mié = entrenamiento días 1-3. Jue/Vie/Sáb/Dom = batalla días 1-4.
const DAY_MAP: Record<number, WarDayInfo> = {
  1: { periodDay: 1, expectedType: 'training' },
  2: { periodDay: 2, expectedType: 'training' },
  3: { periodDay: 3, expectedType: 'training' },
  4: { periodDay: 1, expectedType: 'warDay' },
  5: { periodDay: 2, expectedType: 'warDay' },
  6: { periodDay: 3, expectedType: 'warDay' },
  0: { periodDay: 4, expectedType: 'warDay' },
};

// Corte diario real confirmado empíricamente en 9:45 UTC (no 10:00 como dice
// la documentación oficial) — antes de esa hora seguimos en el día anterior.
const CUTOFF_MINUTES_UTC = 9 * 60 + 45;

export function getWarDayInfo(now: Date = new Date()): WarDayInfo {
  let utcDay = now.getUTCDay();
  const minutesUTC = now.getUTCHours() * 60 + now.getUTCMinutes();
  if (minutesUTC < CUTOFF_MINUTES_UTC) {
    utcDay = (utcDay + 6) % 7;
  }
  return DAY_MAP[utcDay];
}
