import { Hero } from '@/components/Hero'
import { MvpCards } from '@/components/MvpCards'
import { AnnouncementBanner } from '@/components/AnnouncementBanner'
import styles from './Dashboard.module.css'

export function Dashboard() {
  return (
    <main className={styles.container}>
      <Hero />
      <MvpCards />
      <AnnouncementBanner />
    </main>
  )
}
