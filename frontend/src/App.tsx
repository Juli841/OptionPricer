import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import AmericanPage from './pages/AmericanPage'
import EuropeanPage from './pages/EuropeanPage'
import PathsPage from './pages/PathsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/european" element={<EuropeanPage />} />
        <Route path="/american" element={<AmericanPage />} />
        <Route path="/paths" element={<PathsPage />} />
        <Route path="*" element={<Navigate to="/european" replace />} />
      </Route>
    </Routes>
  )
}
