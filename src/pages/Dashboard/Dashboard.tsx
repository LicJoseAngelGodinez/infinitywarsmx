import { useState } from 'react'
import { Hero } from '@/components/Hero'
import { MvpCards } from '@/components/MvpCards'
import { AnnouncementBanner } from '@/components/AnnouncementBanner'
import { WhatsAppJoinModal } from '@/components/WhatsAppJoinModal'
import styles from './Dashboard.module.css'

export function Dashboard() {
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false)

  return (
    <main className={styles.container}>
      <Hero />

      <button className={styles.whatsappBtn} onClick={() => setIsWhatsAppOpen(true)}>
        💬 Únete a la comunidad de WhatsApp
      </button>

      <MvpCards />
      <AnnouncementBanner />

      <WhatsAppJoinModal isOpen={isWhatsAppOpen} onClose={() => setIsWhatsAppOpen(false)} />
    </main>
  )
}
