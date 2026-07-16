import { useClanData } from '@/context/ClanDataContext'
import { getWarDayInfo } from '@/utils/warDay'
import { useWarCountdown } from '@/hooks/useWarCountdown'
import styles from './WarStatusBanner.module.css'

export function WarStatusBanner() {
  const { warLive } = useClanData()
  const countdown = useWarCountdown()

  if (!warLive) return null

  const { periodType, sectionIndex, clan } = warLive
  const week = sectionIndex + 1
  const { periodDay } = getWarDayInfo()
  const isColosseum = periodType === 'colosseum'
  const isWar = periodType === 'warDay' || isColosseum
  const variant = isColosseum ? 'colosseum' : isWar ? 'war' : 'training'

  const total = clan.participants.length
  const playing = clan.participants.filter(p => p.decksUsed > 0).length
  const percentage = total ? Math.round((playing / total) * 100) : 0

  return (
    <div className={`${styles.banner} ${styles[variant]}`}>
      <div className={styles.title}>
        {isColosseum
          ? '✦ SEMANA FINAL · COLISEO ABIERTO ✦'
          : isWar
            ? `⚔️ SEMANA ${week} — DÍA DE BATALLA ${periodDay}`
            : `🛡️ SEMANA ${week} — DÍA DE ENTRENAMIENTO ${periodDay}`}
      </div>

      <div className={styles.summary}>
        Fama {clan.fame.toLocaleString()} · Puntos de periodo {clan.periodPoints.toLocaleString()} · Clan Score {clan.clanScore.toLocaleString()}
      </div>

      <div className={styles.participation}>
        👥 {playing}/{total} miembros participando ({percentage}%)
      </div>

      <div className={styles.countdown}>⏱ Reinicio en {countdown}</div>
    </div>
  )
}
