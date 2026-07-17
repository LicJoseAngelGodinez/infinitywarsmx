import { useClanData } from '@/context/ClanDataContext'
import { ROLE_LABEL, ROLE_ICON } from '@/utils/roles'
import styles from './WarRosterTable.module.css'

export function WarRosterTable() {
  const { members } = useClanData()

  if (!members.length) return null

  const sorted = [...members].sort((a, b) => b.fame - a.fame)

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.dotCol}></th>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Fama</th>
            <th>Mazos Usados</th>
            <th>Mazos Hoy</th>
            <th>Barcos Atacados</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(m => {
            const inactive = m.decksUsed === 0
            return (
              <tr key={m.tag}>
                <td className={styles.dotCol}>
                  {inactive && <span className={styles.dot} />}
                </td>
                <td className={styles.name}>{m.clanRank}. {m.name}</td>
                <td>{ROLE_LABEL[m.role]} {ROLE_ICON[m.role]}</td>
                <td>{m.fame}</td>
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
