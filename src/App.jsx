import { Routes, Route } from 'react-router-dom'
import { useContext, useEffect } from 'react'
import { AirQualityContext } from './context/AirQualityContext'
import Navbar from './components/layout/Navbar'
import Dashboard from './pages/Dashboard'
import CityDetail from './pages/CityDetail'
import Favorites from './pages/Favorites'
import ErrorBoundary from './components/ui/ErrorBoundary'

export default function App() {
  const { theme } = useContext(AirQualityContext)

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body transition-colors duration-300">
      <Navbar />
      <ErrorBoundary>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/city/:cityName" element={<CityDetail />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </main>
      </ErrorBoundary>
    </div>
  )
}
