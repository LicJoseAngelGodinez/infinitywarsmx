import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ClanDataProvider, useClanData } from '@/context/ClanDataContext'
import { AuthProvider } from '@/context/AuthContext'
import { LoadingOverlay } from '@/components/LoadingOverlay'
import { ScrollToTop } from '@/components/ScrollToTop'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Dashboard } from '@/pages/Dashboard'
import { Guerra } from '@/pages/Guerra'
import { Reglas } from '@/pages/Reglas'
import { Registro } from '@/pages/Registro'
import { Rankings } from '@/pages/Rankings'
import { AdminDashboard } from '@/pages/AdminDashboard'
import { PlayerProfile } from '@/pages/PlayerProfile'
import { NotFound } from '@/pages/NotFound'
import styles from './App.module.css'

function AppContent() {
  const { isLoading } = useClanData()
  return (
    <>
      <ScrollToTop />
      <LoadingOverlay isLoaded={!isLoading} />
      <Navbar />
      <div className={styles.pageWrapper}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/guerra" element={<Guerra />} />
          <Route path="/reglas" element={<Reglas />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/rankings" element={<Rankings />} />
          <Route path="/jugador/:tag" element={<PlayerProfile />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ClanDataProvider>
          <AppContent />
        </ClanDataProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
