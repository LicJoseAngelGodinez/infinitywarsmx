import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

// Cuántas veces ha estado cada tag en el clan, según membership_periods
// (una fila por estancia continua). Solo se puede leer con sesión de
// admin (RLS via is_admin()), por eso el fetch está gated por sesión.
export function useRejoinCounts() {
  const { session } = useAuth()

  const query = useQuery({
    queryKey: ['admin', 'membership_periods_count'],
    enabled: !!session,
    queryFn: async () => {
      const { data, error } = await supabase.from('membership_periods').select('tag')
      if (error) throw error
      return data as { tag: string }[]
    },
  })

  const countsByTag = new Map<string, number>()
  for (const row of query.data ?? []) {
    countsByTag.set(row.tag, (countsByTag.get(row.tag) ?? 0) + 1)
  }

  return countsByTag
}
