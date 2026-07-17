import { WarStatusBanner } from '@/components/WarStatusBanner'
import styles from './Hero.module.css'
import logo from '@/assets/logo.jpeg'

export function Hero() {
  return (
    <section className={styles.hero}>
      <img src={logo} alt="Infinity Wars MX" className={styles.logo} />
      <WarStatusBanner />
    </section>
  )
}
