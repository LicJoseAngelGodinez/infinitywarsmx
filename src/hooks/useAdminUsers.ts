import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useClanData } from '@/context/ClanDataContext'
import { supabase } from '@/lib/supabase'
import type { Role } from '@/types/clan'

export interface MemberNote {
  tag: string;
  note: string | null;
  flagged: boolean;
  pto_start: string | null;
  pto_end: string | null;
  phrase: string | null;
  img_url: string | null;
}

export interface WhatsAppRegistration {
  tag: string;
  name: string;
  real_name: string | null;
  phone: string;
  registered_at: string;
}

export interface AdminUserRow {
  tag: string;
  name: string;
  clanRank: number;
  role: Role;
  phone: string | null;
  isRegistered: boolean;
  note: MemberNote | null;
}

// Datos completos de member_notes y whatsapp_registrations -- solo se
// pueden leer con sesión de admin (RLS via is_admin()), nunca públicos.
export function useAdminUsers() {
  const { members } = useClanData()
  const queryClient = useQueryClient()

  const notesQuery = useQuery({
    queryKey: ['admin', 'member_notes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('member_notes').select('*')
      if (error) throw error
      return data as MemberNote[]
    },
  })

  const registrationsQuery = useQuery({
    queryKey: ['admin', 'whatsapp_registrations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('whatsapp_registrations').select('*')
      if (error) throw error
      return data as WhatsAppRegistration[]
    },
  })

  const notesByTag = new Map((notesQuery.data ?? []).map(n => [n.tag, n]))
  const registrationsByTag = new Map((registrationsQuery.data ?? []).map(r => [r.tag, r]))
  const memberTags = new Set(members.map(m => m.tag))

  const currentUsers: AdminUserRow[] = members.map(m => ({
    tag: m.tag,
    name: m.name,
    clanRank: m.clanRank,
    role: m.role,
    phone: registrationsByTag.get(m.tag)?.phone ?? null,
    isRegistered: registrationsByTag.has(m.tag),
    note: notesByTag.get(m.tag) ?? null,
  }))

  const formerRegistrations = (registrationsQuery.data ?? []).filter(r => !memberTags.has(r.tag))

  function refetch() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'member_notes'] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'whatsapp_registrations'] })
  }

  return {
    currentUsers,
    formerRegistrations,
    isLoading: notesQuery.isLoading || registrationsQuery.isLoading,
    refetch,
  }
}
