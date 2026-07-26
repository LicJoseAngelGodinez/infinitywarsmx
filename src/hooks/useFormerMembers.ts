import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

export interface FormerMember {
  tag: string;
  name: string;
  joinedDate: string;
  leftDate: string;
  rejoinCount: number;
}

interface PeriodRow {
  tag: string;
  name: string;
  joined_date: string;
  left_date: string | null;
}

// Ex-miembros: tags cuyo periodo más reciente en membership_periods ya
// tiene left_date (si el más reciente sigue abierto, el jugador sigue
// en el clan). rejoinCount = cuántos periodos tiene ese tag en total.
export function useFormerMembers() {
  const { session } = useAuth()

  const query = useQuery({
    queryKey: ['admin', 'membership_periods'],
    enabled: !!session,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membership_periods')
        .select('tag, name, joined_date, left_date')
        .order('joined_date', { ascending: true })
      if (error) throw error
      return data as PeriodRow[]
    },
  })

  const periodsByTag = new Map<string, PeriodRow[]>()
  for (const row of query.data ?? []) {
    const list = periodsByTag.get(row.tag)
    if (list) list.push(row)
    else periodsByTag.set(row.tag, [row])
  }

  const formerMembers: FormerMember[] = []
  for (const periods of periodsByTag.values()) {
    const latest = periods[periods.length - 1]
    if (latest.left_date) {
      formerMembers.push({
        tag: latest.tag,
        name: latest.name,
        joinedDate: latest.joined_date,
        leftDate: latest.left_date,
        rejoinCount: periods.length,
      })
    }
  }

  formerMembers.sort((a, b) => (a.leftDate < b.leftDate ? 1 : -1))

  return { formerMembers, isLoading: query.isLoading }
}
