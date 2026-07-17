import { useState } from 'react'
import { Modal } from '@/components/Modal'
import styles from './Footer.module.css'

const APP_VERSION = '0.1.0'
const CONTACT_EMAIL = 'joseangel.godinez1989@gmail.com'

export function Footer() {
  const [isPolicyOpen, setIsPolicyOpen] = useState(false)

  return (
    <footer className={styles.footer}>
      <nav className={styles.links}>
        <button className={styles.linkBtn} onClick={() => setIsPolicyOpen(true)}>
          Fan Content Policy
        </button>
        <a href={`mailto:${CONTACT_EMAIL}`} className={styles.linkBtn}>Contacto</a>
      </nav>

      <span className={styles.version}>v{APP_VERSION}</span>

      <Modal isOpen={isPolicyOpen} onClose={() => setIsPolicyOpen(false)} title="Fan Content Policy">
        <p>
          Este contenido no está afiliado, respaldado ni patrocinado por Supercell y Supercell no es responsable de él.
          Para más información consulta la{' '}
          <a href="https://supercell.com/en/fan-content-policy/" target="_blank" rel="noreferrer">
            Fan Content Policy
          </a>{' '}
          de Supercell.
        </p>
      </Modal>
    </footer>
  )
}
