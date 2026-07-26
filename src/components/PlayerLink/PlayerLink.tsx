import { Link } from 'react-router-dom'
import { useClanData } from '@/context/ClanDataContext'
import styles from './PlayerLink.module.css'

interface PlayerLinkProps {
  tag: string;
  name: string;
  className?: string;
}

// Nombre de jugador clickeable → /jugador/:tag, pero SOLO si el tag
// pertenece al roster actual (useClanData().members). Ex-miembros (ej. en
// las tablas de historial del AdminDashboard) caen aquí también y
// simplemente se renderizan como texto plano, sin link.
export function PlayerLink({ tag, name, className }: PlayerLinkProps) {
  const { members } = useClanData()
  const isActiveMember = members.some(m => m.tag === tag)

  if (!isActiveMember) return <span className={className}>{name}</span>

  return (
    <Link to={`/jugador/${encodeURIComponent(tag)}`} className={`${styles.link} ${className ?? ''}`}>
      {name}
    </Link>
  )
}
