import type { Role } from '@/types/clan';

export const ROLE_LABEL: Record<Role, string> = {
  leader:   'Líder',
  coLeader: 'Colíder',
  elder:    'Veterano',
  member:   'Miembro',
};

export const ROLE_ICON: Record<Role, string> = {
  leader:   '👑',
  coLeader: '🛡️',
  elder:    '⚔️',
  member:   '👤',
};
