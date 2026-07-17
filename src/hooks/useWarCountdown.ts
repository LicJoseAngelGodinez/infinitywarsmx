import { useEffect, useState } from 'react';

// Target confirmado empíricamente: 9:45:17 UTC (~15 min antes de lo que
// dice la documentación oficial de Clash Royale).
function msUntilNextCutoff(now: Date): number {
  const target = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 9, 45, 17);
  let diff = target - now.getTime();
  if (diff < 0) diff += 24 * 60 * 60 * 1000;
  return diff;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function useWarCountdown(): string {
  const [label, setLabel] = useState(() => formatDuration(msUntilNextCutoff(new Date())));

  useEffect(() => {
    const interval = setInterval(() => {
      setLabel(formatDuration(msUntilNextCutoff(new Date())));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return label;
}
