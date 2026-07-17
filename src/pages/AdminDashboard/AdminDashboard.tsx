import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { BlackListTable } from '@/components/BlackListTable'
import styles from './AdminDashboard.module.css'

export function AdminDashboard() {
  const { session, isLoading } = useAuth()

  if (isLoading) return null
  if (!session) return <Navigate to="/" replace />

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.description}>
        Black List — los 20 miembros con bajo desempeño (menos participación, menos fama, menos donaciones).
      </p>

      <BlackListTable />
    </main>
  )
}
