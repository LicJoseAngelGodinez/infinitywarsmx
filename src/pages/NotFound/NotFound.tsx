import { Link } from 'react-router-dom'
import styles from './NotFound.module.css'
import logo from '@/assets/logo404.jpeg'

export function NotFound() {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <img src={logo} alt="Infinity Wars MX" className={styles.logo} />

        <h1 className={styles.code}>404</h1>

        <p className={styles.message}>
          Este sendero no existe en ningún mapa del reino.
          <br />
          Ni los cuervos de Odín te guiarían hasta aquí.
        </p>

        <div className={styles.buttons}>
          <Link to="/" className={styles.btnPrimary}>
            Volver al inicio
          </Link>
          {/* <Link to="/admin" className={styles.btnSecondary}>
            Panel de Admin
          </Link> */}
        </div>
      </div>
    </main>
  )
}
