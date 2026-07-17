import { WarRosterTable } from '@/components/WarRosterTable'
import styles from './Guerra.module.css'

export function Guerra() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Guerra Actual</h1>
      <p className={styles.description}>
        Participación de cada miembro en la guerra de esta semana — fama, mazos usados y ataques a barco.
        El punto rojo marca a quien todavía no ha jugado ningún mazo.
      </p>

      <WarRosterTable />
    </main>
  )
}
