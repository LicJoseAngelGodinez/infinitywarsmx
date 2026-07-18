import type { WarLiveResponse } from '@/types/clan'
import { useClanData } from '@/context/ClanDataContext'
import { useWarCountdown } from '@/hooks/useWarCountdown'
import styles from './WarStatusBanner.module.css'
import trainingImg from '@/assets/training.webp'
import warImg from '@/assets/war.webp'
import colosseumImg from '@/assets/colosseum.webp'

type Phase = 'training' | 'war' | 'colosseum'

const PHASE_LABEL: Record<Phase, string> = {
  training:  'Entrenamiento',
  war:       'Guerra',
  colosseum: 'Coliseo',
}

const PHASE_ICON: Record<Phase, string> = {
  training:  '🏝️',
  war:       '⚔️',
  colosseum: '🏛️',
}

const PHASE_CLASS: Record<Phase, string> = {
  training:  'phaseTraining',
  war:       'phaseWar',
  colosseum: 'phaseColosseum',
}

const PHASE_IMAGE: Record<Phase, string> = {
  training:  trainingImg,
  war:       warImg,
  colosseum: colosseumImg,
}

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] // getDay(): 0=Dom..6=Sáb

function getCurrentWeekDates(today: Date): Date[] {
  const day = today.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

interface WeekOverviewCardProps {
  phase: Phase
  sectionIndex: number
  playing: number
  total: number
  percentage: number
  clan: WarLiveResponse['clan']
  countdown: string
}

function WeekOverviewCard({ phase, sectionIndex, playing, total, percentage, clan, countdown }: WeekOverviewCardProps) {
  const week = sectionIndex + 1
  const today = new Date()
  const weekDates = getCurrentWeekDates(today)
  const totalWeeks = Math.max(week, 4)

  return (
    <div className={`${styles.previewCard} ${styles[PHASE_CLASS[phase]]}`}>
      <img
        src={PHASE_IMAGE[phase]}
        alt=""
        draggable={false}
        className={styles.previewMascot}
      />

      <div className={styles.previewContent}>
        <div className={styles.previewHeader}>
          <h2 className={styles.previewTitle}>{PHASE_LABEL[phase]}</h2>
          <span className={styles.previewPill}>{PHASE_ICON[phase]}</span>
        </div>

        <div className={styles.sharedInfo}>
          <div className={styles.summary}>
            Fama {clan.fame.toLocaleString()} · Clan Score {clan.clanScore.toLocaleString()}
          </div>

          <div className={styles.participation}>
            👥 {playing}/{total} miembros participando ({percentage}%)
          </div>

          <div className={styles.countdown}>⏱ Reinicio en {countdown}</div>
        </div>

        <div className={styles.previewDays}>
          {weekDates.map(d => {
            const isToday = isSameDay(d, today)
            return (
              <div key={d.toISOString()} className={styles.previewDay}>
                <span className={`${styles.previewDayNum} ${isToday ? styles.previewDayToday : ''}`}>
                  {d.getDate()}
                </span>
                <span className={styles.previewDayLabel}>{WEEKDAY_LABELS[d.getDay()]}</span>
              </div>
            )
          })}
        </div>

        <div className={styles.previewDots}>
          {Array.from({ length: totalWeeks }, (_, i) =>
            i === sectionIndex
              ? <span key={i} className={styles.previewWeekPill}>Semana {i + 1}</span>
              : <span key={i} className={styles.previewDot} />
          )}
        </div>
      </div>
    </div>
  )
}

export function WarStatusBanner() {
  const { warLive, members } = useClanData()
  const countdown = useWarCountdown()

  const phase: Phase = warLive
    ? warLive.periodType === 'colosseum'
      ? 'colosseum'
      : warLive.periodType === 'warDay'
        ? 'war'
        : 'training'
    : 'training'

  if (!warLive) return null

  const { sectionIndex, clan } = warLive

  // Participantes que ya no son miembros actuales del clan (salieron a
  // media semana, su participación quedó "congelada" en war_live) no
  // deben contar para el total — el denominador es el roster actual.
  const memberTags = new Set(members.map(m => m.tag))
  const currentParticipants = clan.participants.filter(p => memberTags.has(p.tag))

  const total = members.length
  const playing = currentParticipants.filter(p => p.decksUsed > 0).length
  const percentage = total ? Math.round((playing / total) * 100) : 0

  // clan.fame de la API llega en 0 fuera de días de batalla — se calcula
  // sumando la fama de cada participante en vez de confiar en ese campo.
  const totalFame = clan.participants.reduce((sum, p) => sum + p.fame, 0)

  return (
    <WeekOverviewCard
      phase={phase}
      sectionIndex={sectionIndex}
      playing={playing}
      total={total}
      percentage={percentage}
      clan={{ ...clan, fame: totalFame }}
      countdown={countdown}
    />
  )
}
