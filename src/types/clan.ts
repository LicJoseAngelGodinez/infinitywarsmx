export type Role = 'leader' | 'coLeader' | 'elder' | 'member';
export type PeriodType = 'training' | 'warDay';

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
