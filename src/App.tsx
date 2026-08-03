import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import { MichaelDotsBackground } from '@/components/layout/MichaelDotsBackground'
import { TasyaCloudsBackground } from '@/components/layout/TasyaCloudsBackground'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { WishlistPage } from '@/pages/WishlistPage'
import { MemoriesPage } from '@/pages/MemoriesPage'
import { GalleryPage } from '@/pages/GalleryPage'
import { SchedulePage } from '@/pages/SchedulePage'
import { LettersPage } from '@/pages/LettersPage'
import { GoalsPage } from '@/pages/GoalsPage'
import { JourneyMapPage } from '@/pages/JourneyMapPage'
import { DateIdeasPage } from '@/pages/DateIdeasPage'
import { ArcadePage } from '@/pages/ArcadePage'
import { GamePage } from '@/pages/GamePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <MichaelDotsBackground />
      <TasyaCloudsBackground />
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="memories" element={<MemoriesPage />} />
              <Route path="gallery" element={<GalleryPage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="letters" element={<LettersPage />} />
              <Route path="goals" element={<GoalsPage />} />
              <Route path="journey" element={<JourneyMapPage />} />
              <Route path="date-ideas" element={<DateIdeasPage />} />
              <Route path="arcade" element={<ArcadePage />} />
              <Route path="arcade/:gameKey" element={<GamePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
