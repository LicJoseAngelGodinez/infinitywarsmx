import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ClanDataProvider, useClanData } from '@/context/ClanDataContext'
import { LoadingOverlay } from '@/components/LoadingOverlay'
import { Navbar } from '@/components/Navbar'
import { Dashboard } from '@/pages/Dashboard'
import { NotFound } from '@/pages/NotFound'

function AppContent() {
  const { isLoading } = useClanData()
  return (
    <>
      <LoadingOverlay isLoaded={!isLoading} />
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ClanDataProvider>
        <AppContent />
      </ClanDataProvider>
    </BrowserRouter>
  )
}
