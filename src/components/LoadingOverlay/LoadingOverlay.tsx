import { useState, useEffect } from 'react'
import styles from './LoadingOverlay.module.css'
import logo from '@/assets/logo404.jpeg'

type Phase = 'loading' | 'bigPulse' | 'slideUp' | 'done'

const DOTS = ['', '.', '..', '...']

interface Props {
  isLoaded: boolean
}

export function LoadingOverlay({ isLoaded }: Props) {
  const [phase, setPhase] = useState<Phase>('loading')
  const [dotIndex, setDotIndex] = useState(0)

  useEffect(() => {
    if (isLoaded && phase === 'loading') setPhase('bigPulse')
  }, [isLoaded, phase])

  useEffect(() => {
    if (phase !== 'loading') return
    const interval = setInterval(() => setDotIndex(i => (i + 1) % 4), 500)
    return () => clearInterval(interval)
  }, [phase])

  if (phase === 'done') return null

  const logoClass = [
    styles.logo,
    phase === 'loading'   ? styles.pulsing    : '',
    phase === 'bigPulse'  ? styles.bigPulsing  : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={`${styles.overlay} ${phase === 'slideUp' ? styles.slidingUp : ''}`}
      onAnimationEnd={() => { if (phase === 'slideUp') setPhase('done') }}
    >
      <div className={styles.content}>
        <img
          src={logo}
          alt="Infinity Wars MX"
          className={logoClass}
          onAnimationEnd={(e) => {
            e.stopPropagation()
            if (phase === 'bigPulse') setPhase('slideUp')
          }}
        />
        <p className={`${styles.text} ${phase !== 'loading' ? styles.textFade : ''}`}>
          Cargando{DOTS[dotIndex]}
        </p>
      </div>
    </div>
  )
}
