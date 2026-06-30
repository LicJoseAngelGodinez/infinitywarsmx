import { Link } from 'react-router-dom'
import styles from './NotFound.module.css'

export function NotFound() {
  return (
    <main className={styles.container}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.message}>Esta página no existe.</p>
      <Link to="/" className={styles.link}>Volver al inicio</Link>
    </main>
  )
}
