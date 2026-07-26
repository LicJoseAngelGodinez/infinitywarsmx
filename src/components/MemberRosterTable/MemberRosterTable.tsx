import { useEffect, useState } from 'react'
import { useClanData } from '@/context/ClanDataContext'
import { useAuth } from '@/context/AuthContext'
import { useRejoinCounts } from '@/hooks/useRejoinCounts'
import { PlayerLink } from '@/components/PlayerLink'
import { ROLE_LABEL, ROLE_ICON } from '@/utils/roles'
import { MIN_DONATIONS } from '@/utils/mvp'
import styles from './MemberRosterTable.module.css'

const INACTIVE_THRESHOLD_MS = 60 * 24 * 60 * 60 * 1000 // ~2 meses sin conectarse

export function MemberRosterTable() {
  const { members, warLive } = useClanData()
  const { session } = useAuth()
  const rejoinCounts = useRejoinCounts()
  const [openTag, setOpenTag] = useState<string | null>(null)

  // Tap/click fuera del ícono cierra el tooltip -- sin esto, en touch
  // se quedaría abierto hasta tocar el mismo ícono otra vez.
  useEffect(() => {
    if (!openTag) return
    function handleOutside(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest(`[data-rejoin-badge]`)) setOpenTag(null)
    }
    document.addEventListener('click', handleOutside)
    return () => document.removeEventListener('click', handleOutside)
  }, [openTag])

  if (!members.length) return null

  const isTraining = !warLive || (warLive.periodType !== 'warDay' && warLive.periodType !== 'colosseum')
  const now = Date.now()

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.dotCol}></th>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Trofeos / Arena</th>
            <th>Donaciones</th>
            <th>Mazos Usados</th>
            <th>Mazos Hoy</th>
            <th>Barcos Atacados</th>
          </tr>
        </thead>
        <tbody>
          {members.map(m => {
            const lastSeenMs = m.lastSeen ? new Date(m.lastSeen).getTime() : 0
            const inactive   = now - lastSeenMs > INACTIVE_THRESHOLD_MS
            const lowDons    = !isTraining && m.donations < MIN_DONATIONS
            const rejoinCount = rejoinCounts.get(m.tag) ?? 0

            return (
              <tr key={m.tag}>
                <td className={styles.dotCol}>
                  {inactive
                    ? <span className={`${styles.dot} ${styles.dotRed}`} />
                    : lowDons
                      ? <span className={`${styles.dot} ${styles.dotYellow}`} />
                      : null}
                </td>
                <td className={styles.name}>
                  {m.clanRank}. <PlayerLink tag={m.tag} name={m.name} />
                  {session && rejoinCount > 1 && (
                    <span className={styles.rejoinWrapper} data-rejoin-badge>
                      <button
                        type="button"
                        className={styles.rejoinIcon}
                        onClick={() => setOpenTag(openTag === m.tag ? null : m.tag)}
                      >
                        🔁
                      </button>
                      {openTag === m.tag && (
                        <span className={styles.rejoinTooltip}>
                          Ha estado en el clan {rejoinCount} veces
                        </span>
                      )}
                    </span>
                  )}
                </td>
                <td>{ROLE_LABEL[m.role]} {ROLE_ICON[m.role]}</td>
                <td>{m.trophies.toLocaleString()} / {m.arena?.name ?? '—'}</td>
                <td>
                  <span className={styles.donationsGiven}>{m.donations}</span>
                  {' / '}
                  <span className={m.donationsReceived > m.donations ? styles.donationsBad : styles.donationsGood}>
                    {m.donationsReceived}
                  </span>
                </td>
                <td>{m.decksUsed}</td>
                <td>{m.decksUsedToday}</td>
                <td>{m.boatAttacks} 🚢</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
