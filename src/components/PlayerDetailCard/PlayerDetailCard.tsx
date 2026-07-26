import type { ReactNode } from 'react'
import styles from './PlayerDetailCard.module.css'

interface PlayerDetailCardProps {
  children: ReactNode;
}

// Marco visual (gradientes radiales + borde giratorio con glow) reutilizable
// -- por ahora envuelve la imagen de la carta favorita en el perfil de
// jugador, pero no asume contenido específico.
export function PlayerDetailCard({ children }: PlayerDetailCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardBorder} />
      {children}
    </div>
  )
}
