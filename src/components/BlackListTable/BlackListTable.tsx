import { useClanData } from '@/context/ClanDataContext'
import { ROLE_LABEL, ROLE_ICON } from '@/utils/roles'
import styles from './BlackListTable.module.css'

const WORST_COUNT = 20

export function BlackListTable() {
  const { members } = useClanData()

  if (!members.length) return null

  const worst = [...members]
    .sort((a, b) => a.decksUsed - b.decksUsed || a.fame - b.fame || a.donations - b.donations)
    .slice(0, WORST_COUNT)

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.dotCol}></th>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Trofeos</th>
            <th>Donaciones</th>
            <th>Fama</th>
            <th>Mazos Usados</th>
          </tr>
        </thead>
        <tbody>
          {worst.map(m => (
            <tr key={m.tag}>
              <td className={styles.dotCol}>
                {m.role === 'elder' && <span className={`${styles.dot} ${styles.dotYellow}`} />}
                {m.role === 'coLeader' && <span className={`${styles.dot} ${styles.dotRed}`} />}
              </td>
              <td className={styles.name}>{m.clanRank}. {m.name}</td>
              <td>{ROLE_LABEL[m.role]} {ROLE_ICON[m.role]}</td>
              <td>{m.trophies.toLocaleString()}</td>
              <td>
                <span className={styles.donationsGiven}>{m.donations}</span>
                {' / '}
                <span className={m.donationsReceived > m.donations ? styles.donationsBad : styles.donationsGood}>
                  {m.donationsReceived}
                </span>
              </td>
              <td>{m.fame}</td>
              <td>{m.decksUsed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
