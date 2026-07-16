import { useClanData } from '@/context/ClanDataContext'
import { ROLE_ICON } from '@/utils/roles'
import {
  getDonationsPct,
  getTopDonators,
  getWarParticipationPct,
  getTopWarParticipants,
  getVeteranCandidates,
  type MvpEntry,
} from '@/utils/mvp'
import styles from './MvpCards.module.css'

interface CardProps {
  title: string
  entries: MvpEntry[]
  emptyLabel: string
}

function Card({ title, entries, emptyLabel }: CardProps) {
  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>{title}</h3>
      {entries.length === 0 ? (
        <p className={styles.empty}>{emptyLabel}</p>
      ) : (
        <ol className={styles.list}>
          {entries.map((entry, i) => (
            <li key={entry.tag} className={styles.item}>
              <span className={styles.rank}>{i + 1}. {entry.name} {ROLE_ICON[entry.role]}</span>
              <span className={styles.value}>{entry.value.toLocaleString()}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export function MvpCards() {
  const { members, warLive } = useClanData()

  if (!members.length) return null

  const participants = warLive?.clan.participants ?? []
  const isWarDay = warLive?.periodType === 'warDay' || warLive?.periodType === 'colosseum'

  const donationsPct    = getDonationsPct(members)
  const topDonators     = getTopDonators(members)
  const participationPct = getWarParticipationPct(participants)
  const topParticipants = getTopWarParticipants(members, participants)
  const veteranCandidates = getVeteranCandidates(members, participants, isWarDay)

  return (
    <section className={styles.grid}>
      <Card
        title={`🏆 MVP — Donaciones ${donationsPct}%`}
        entries={topDonators}
        emptyLabel="— sin datos —"
      />

      {isWarDay && (
        <Card
          title={`⚔️ MVP — Guerra ${participationPct}%`}
          entries={topParticipants}
          emptyLabel="— sin datos de guerra —"
        />
      )}

      {veteranCandidates.length > 0 && (
        <Card
          title="🌟 Candidatos a Veteranía"
          entries={veteranCandidates}
          emptyLabel=""
        />
      )}
    </section>
  )
}
