import type { Member, WarParticipant } from '@/types/clan';
import { getWarDayInfo } from './warDay';

// Umbral visual de donaciones bajas — no persistido, mismo default que legacy.html.
export const MIN_DONATIONS = 150;

export interface MvpEntry {
  tag: string;
  name: string;
  role: Member['role'];
  clanRank: number;
  value: number;
}

function byTag(participants: WarParticipant[]) {
  const map: Record<string, WarParticipant> = {};
  participants.forEach(p => { map[p.tag] = p; });
  return map;
}

export function getDonationsPct(members: Member[]): number {
  if (!members.length) return 0;
  const met = members.filter(m => m.donations >= MIN_DONATIONS).length;
  return Math.round((met / members.length) * 100);
}

export function getTopDonators(members: Member[], limit = 5): MvpEntry[] {
  return [...members]
    .sort((a, b) => b.donations - a.donations)
    .slice(0, limit)
    .map(m => ({ tag: m.tag, name: m.name, role: m.role, clanRank: m.clanRank, value: m.donations }));
}

// El denominador es el roster actual, no participants.length -- war_live
// puede traer participantes que ya no son miembros del clan (salieron a
// media semana, su participación quedó "congelada" para esa guerra).
export function getWarParticipationPct(members: Member[], participants: WarParticipant[]): number {
  if (!members.length) return 0;
  const memberTags = new Set(members.map(m => m.tag));
  const playing = participants.filter(p => memberTags.has(p.tag) && p.decksUsed > 0).length;
  return Math.round((playing / members.length) * 100);
}

export function getTopWarParticipants(members: Member[], participants: WarParticipant[], limit = 5): MvpEntry[] {
  const participantsByTag = byTag(participants);
  return [...members]
    .map(m => {
      const p = participantsByTag[m.tag];
      return { ...m, decksUsed: p?.decksUsed ?? 0, fame: p?.fame ?? 0 };
    })
    .sort((a, b) => b.decksUsed - a.decksUsed || b.fame - a.fame || b.donations - a.donations)
    .slice(0, limit)
    .map(m => ({ tag: m.tag, name: m.name, role: m.role, clanRank: m.clanRank, value: m.fame }));
}

// Candidatos a Veteranía: role 'member', cumple donaciones y, si es día de
// batalla, ≥75% de los mazos disponibles hasta ese día (4 por día).
export function getVeteranCandidates(members: Member[], participants: WarParticipant[], isWarDay: boolean, limit = 5): MvpEntry[] {
  const participantsByTag = byTag(participants);
  const { periodDay } = getWarDayInfo();
  const deckThreshold = isWarDay ? Math.ceil(periodDay * 4 * 0.75) : 0;

  const eligible = members.filter(m => {
    if (m.role !== 'member' || m.donations < MIN_DONATIONS) return false;
    if (isWarDay) return (participantsByTag[m.tag]?.decksUsed ?? 0) >= deckThreshold;
    return true;
  });

  return eligible
    .map(m => {
      const p = participantsByTag[m.tag];
      return { ...m, decksUsed: p?.decksUsed ?? 0, fame: p?.fame ?? 0 };
    })
    .sort((a, b) => b.decksUsed - a.decksUsed || b.fame - a.fame || b.donations - a.donations)
    .slice(0, limit)
    .map(m => ({ tag: m.tag, name: m.name, role: m.role, clanRank: m.clanRank, value: m.fame }));
}
