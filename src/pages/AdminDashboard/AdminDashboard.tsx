import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { BlackListTable } from '@/components/BlackListTable'
import { UsersSection } from '@/components/UsersSection'
import styles from './AdminDashboard.module.css'

type Section = 'blacklist' | 'users'

const SECTIONS: { key: Section; label: string; icon: string }[] = [
  { key: 'blacklist', label: 'Black List', icon: '🚫' },
  { key: 'users', label: 'Usuarios', icon: '👥' },
]

export function AdminDashboard() {
  const { session, isLoading } = useAuth()
  const [activeSection, setActiveSection] = useState<Section>('blacklist')
  const [isExpanded, setIsExpanded] = useState(false)

  if (isLoading) return null
  if (!session) return <Navigate to="/" replace />

  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} ${isExpanded ? styles.sidebarExpanded : ''}`}>
        <button
          className={styles.toggleBtn}
          onClick={() => setIsExpanded(v => !v)}
          aria-label={isExpanded ? 'Contraer menú' : 'Expandir menú'}
        >
          {isExpanded ? '«' : '»'}
        </button>

        <nav className={styles.nav}>
          {SECTIONS.map(section => (
            <button
              key={section.key}
              className={`${styles.navItem} ${activeSection === section.key ? styles.navItemActive : ''}`}
              onClick={() => setActiveSection(section.key)}
              title={section.label}
            >
              <span className={styles.navIcon}>{section.icon}</span>
              <span className={styles.navLabel}>{section.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className={`${styles.content} ${isExpanded ? styles.contentShifted : ''}`}>
        {activeSection === 'blacklist' && (
          <>
            <h1 className={styles.title}>Black List</h1>
            <p className={styles.description}>
              Los 20 miembros con bajo desempeño (menos mazos usados, menos fama, menos donaciones).
            </p>
            <BlackListTable />
          </>
        )}

        {activeSection === 'users' && (
          <>
            <h1 className={styles.title}>Usuarios</h1>
            <p className={styles.description}>
              Miembros actuales del clan — registro de WhatsApp, PTO y notas.
            </p>
            <UsersSection />
          </>
        )}
      </main>
    </div>
  )
}
