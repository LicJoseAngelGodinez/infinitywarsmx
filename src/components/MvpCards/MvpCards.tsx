import { useClanData } from '@/context/ClanDataContext'
import { getTopDonators, getTopWarParticipants, getVeteranCandidates } from '@/utils/mvp'
import styles from './MvpCards.module.css'
import donationsImg from '@/assets/donations.webp'
import participationImg from '@/assets/participation.webp'
import eldersImg from '@/assets/elders.webp'
import noEldersImg from '@/assets/noelders.webp'

export function MvpCards() {
  const { members, warLive } = useClanData()

  if (!members.length) return null

  const participants = warLive?.clan.participants ?? []
  const isWarDay = warLive?.periodType === 'warDay' || warLive?.periodType === 'colosseum'

  const [topDonator] = getTopDonators(members, 1)
  const [topParticipant] = getTopWarParticipants(members, participants, 1)
  const [topCandidate] = getVeteranCandidates(members, participants, isWarDay, 1)

  return (
    <section className={styles.grid}>
      <div className={styles.card}>
        <div>
          <p className={styles.category}>MVP</p>
          <p className={styles.category}>Donaciones</p>
        </div>
        <div className={styles.imageWrap}>
          <img src={donationsImg} alt="Donaciones" className={styles.cardImage} />
        </div>
        <div>
          <p className={styles.name}>{topDonator.name}</p>
          <p className={styles.rank}>Posición #{topDonator.clanRank}</p>
          <p className={styles.score}>{topDonator.value.toLocaleString()} donaciones</p>
        </div>
      </div>

      {isWarDay && (
        <div className={styles.card}>
          <div>
            <p className={styles.category}>MVP</p>
            <p className={styles.category}>Guerra</p>
          </div>
          <div className={styles.imageWrap}>
            <img src={participationImg} alt="Participación en guerra" className={styles.cardImage} />
          </div>
          <div>
            <p className={styles.name}>{topParticipant.name}</p>
            <p className={styles.rank}>Posición #{topParticipant.clanRank}</p>
            <p className={styles.score}>{topParticipant.value.toLocaleString()} fama</p>

          </div>
        </div>
      )}

      {topCandidate ? (
        <div className={styles.card}>
          <div>
            <p className={styles.category}>Veteranos</p>
            <br />
          </div>
          <div className={styles.imageWrap}>
            <img src={eldersImg} alt="Candidato a veteranía" className={styles.cardImage} />
          </div>
          <div>
            <p className={styles.name}>{topCandidate.name}</p>
            <p className={styles.rank}>Posición #{topCandidate.clanRank}</p>
            <p className={styles.score}>Candidato</p>

          </div>
        </div>
      ) : (
        <div className={styles.card}>
          <p className={styles.category}>Veteranos</p>
          <div className={styles.imageWrap}>
            <img src={noEldersImg} alt="Sin candidatos a veteranía" className={styles.cardImage} />
          </div>
          <div>
            <p className={styles.name}>Sin candidatos</p>
            <p className={styles.explanation}>
              Ningún miembro cumple todavía el umbral de donaciones{isWarDay ? ' y de mazos usados en la guerra' : ''} necesario para ser candidato a veteranía.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
