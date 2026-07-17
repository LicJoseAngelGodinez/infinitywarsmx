import { useClanData } from '@/context/ClanDataContext'
import { ROLE_LABEL, ROLE_ICON } from '@/utils/roles'
import { MIN_DONATIONS } from '@/utils/mvp'
import styles from './MemberRosterTable.module.css'

const INACTIVE_THRESHOLD_MS = 60 * 24 * 60 * 60 * 1000 // ~2 meses sin conectarse

export function MemberRosterTable() {
  const { members, warLive } = useClanData()

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

            return (
              <tr key={m.tag}>
                <td className={styles.dotCol}>
                  {inactive
                    ? <span className={`${styles.dot} ${styles.dotRed}`} />
                    : lowDons
                      ? <span className={`${styles.dot} ${styles.dotYellow}`} />
                      : null}
                </td>
                <td className={styles.name}>{m.clanRank}. {m.name}</td>
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
