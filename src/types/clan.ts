export type Role = 'leader' | 'coLeader' | 'elder' | 'member';
export type PeriodType = 'training' | 'warDay' | 'colosseum';

export interface Member {
  tag: string;
  name: string;
  role: Role;
  trophies: number;
  arena: { name: string } | null;
  clanRank: number;
  donations: number;
  donationsReceived: number;
  lastSeen: string | null;
  decksUsed: number;
  decksUsedToday: number;
  fame: number;
  boatAttacks: number;
}

export interface MembersResponse {
  snapshot_date: string;
  members_snapshot_ts: string | null;
  items: Member[];
}

export interface WarParticipant {
  tag: string;
  name: string;
  role: Role | null;
  decksUsed: number;
  decksUsedToday: number;
  fame: number;
  boatAttacks: number;
}

export interface WarLiveResponse {
  periodType: PeriodType;
  sectionIndex: number;
  snapshot_ts: string;
  clan: {
    fame: number;
    periodPoints: number;
    clanScore: number;
    participants: WarParticipant[];
  };
}

// iconUrls se deja tal cual llega del API de Clash (no se mapea/desestructura
// a llaves específicas) -- no sabemos qué variantes puede traer cada carta.
export interface PlayerCard {
  name: string;
  id?: number;
  elixirCost?: number;
  iconUrls: Record<string, string>;
}

export interface PlayerFavouriteCard {
  name: string;
  iconUrls: Record<string, string>;
  rarity: string;
}

// Forma de lo que vamos a guardar del API de /players/{tag} (ver
// clean-player.json) -- todavía no viene de Supabase, hoy es data mockeada.
export interface PlayerDetail {
  tag: string;
  name: string;
  expLevel: number;
  trophies: number;
  bestTrophies: number;
  wins: number;
  losses: number;
  battleCount: number;
  threeCrownWins: number;
  role: Role;
  totalDonations: number;
  warDayWins: number;
  currentDeck: PlayerCard[];
  currentDeckSupportCards: PlayerCard[];
  currentFavouriteCard: PlayerFavouriteCard;
}
