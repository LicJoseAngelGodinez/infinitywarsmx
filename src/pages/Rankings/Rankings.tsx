import { RankingsTables } from '@/components/RankingsTables'
import { MemberRosterTable } from '@/components/MemberRosterTable'
import styles from './Rankings.module.css'

export function Rankings() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Rankings</h1>
      <p className={styles.description}>
        Top 5 por donaciones, participación en la guerra actual y candidatos a veteranía.
      </p>

      <RankingsTables />
      <MemberRosterTable />
    </main>
  )
}
