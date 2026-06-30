import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ClanDataProvider } from '@/context/ClanDataContext'
import { Dashboard } from '@/pages/Dashboard'
import { NotFound } from '@/pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <ClanDataProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ClanDataProvider>
    </BrowserRouter>
  )
}
