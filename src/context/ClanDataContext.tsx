import { createContext, useContext, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Member, MembersResponse, WarLiveResponse } from '@/types/clan'

interface ClanDataContextValue {
  members: Member[];
  warLive: WarLiveResponse | null;
  snapshotDate: string | null;
  isLoading: boolean;
  isError: boolean;
}

const ClanDataContext = createContext<ClanDataContextValue | null>(null)

// URL absoluta: cuando el sitio se sirve vía rewrite (ej. mipagina.com/gaming),
// fetch() con ruta relativa resuelve contra ese origen, no contra Vercel.
const API_BASE = 'https://infinitywarsmx.vercel.app'

export function ClanDataProvider({ children }: { children: ReactNode }) {
  const membersQuery = useQuery<MembersResponse>({
    queryKey: ['members'],
    queryFn: () => fetch(`${API_BASE}/api/members`).then(r => r.json()),
  })

  const warQuery = useQuery<WarLiveResponse>({
    queryKey: ['war-live'],
    queryFn: () => fetch(`${API_BASE}/api/war-live`).then(r => r.json()),
  })

  return (
    <ClanDataContext.Provider value={{
      members:      membersQuery.data?.items ?? [],
      warLive:      warQuery.data ?? null,
      snapshotDate: membersQuery.data?.snapshot_date ?? null,
      isLoading:    membersQuery.isLoading || warQuery.isLoading,
      isError:      membersQuery.isError   || warQuery.isError,
    }}>
      {children}
    </ClanDataContext.Provider>
  )
}

export function useClanData() {
  const ctx = useContext(ClanDataContext)
  if (!ctx) throw new Error('useClanData must be used within ClanDataProvider')
  return ctx
}
