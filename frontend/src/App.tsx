import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import WelcomePage from './pages/WelcomePage'
import AccountPage from './pages/AccountPage'
import AmericanPage from './pages/AmericanPage'
import AuthPage from './pages/AuthPage'
import BlackScholesPage from './pages/BlackScholesPage'
import ContinuousPage from './pages/ContinuousPage'
import EuropeanPage from './pages/EuropeanPage'
import HedgingPage from './pages/HedgingPage'
import MonteCarloPage from './pages/MonteCarloPage'
import PathsPage from './pages/PathsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/european" element={<EuropeanPage />} />
        <Route path="/american" element={<AmericanPage />} />
        <Route path="/paths" element={<PathsPage />} />
        <Route path="/hedging" element={<HedgingPage />} />
        <Route path="/continuous" element={<ContinuousPage />} />
        <Route path="/montecarlo" element={<MonteCarloPage />} />
        <Route path="/blackscholes" element={<BlackScholesPage />} />
        {/* distinct keys so switching between them remounts the form and drops its error and fields */}
        <Route path="/login" element={<AuthPage key="login" mode="login" />} />
        <Route path="/register" element={<AuthPage key="register" mode="register" />} />
        <Route element={<RequireAuth />}>
          <Route path="/account" element={<AccountPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
