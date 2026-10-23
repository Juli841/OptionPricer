import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import PasswordMeter from '../components/PasswordMeter'
import { useAuth } from '../context/auth'
import { meetsRules } from '../utils/password'
import { USERNAME_HINT, validUsername } from '../utils/username'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // shape only; the server does the strict check

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { user, loading, login, register } = useAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/account'
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [busy, setBusy] = useState(false)
  const [show, setShow] = useState(false)
  const isLogin = mode === 'login'

  if (!loading && user) return <Navigate to={from} replace />

  const checkEmail = () => {
    const ok = EMAIL.test(email.trim())
    setEmailError(ok ? '' : 'Enter a valid email address, like name@example.com')
    return ok
  }

  const checkUsername = () => {
    const ok = validUsername(username)
    setUsernameError(ok ? '' : `Choose a username: ${USERNAME_HINT}`)
    return ok
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const emailOk = checkEmail()
    const nameOk = isLogin || checkUsername()
    if (!emailOk || !nameOk) return
    if (!password) return setError('Enter your password')
    setBusy(true)
    try {
      await (isLogin ? login({ email, password }) : register({ email, username, password }))
      navigate(from, { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown error'
      // a taken or invalid username belongs under its own field
      if (/username/i.test(message)) setUsernameError(message)
      else setError(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card auth" onSubmit={submit} noValidate>
      <h2>{isLogin ? 'Log in' : 'Create account'}</h2>
      <label>
        <span>Email</span>
        <input
          type="email"
          autoComplete="email"
          required
          aria-invalid={!!emailError}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setEmailError('')
          }}
          onBlur={() => email && checkEmail()}
        />
        {emailError && <small role="alert" className="field-error">{emailError}</small>}
      </label>
      {!isLogin && (
        <label>
          <span>Username</span>
          <input
            type="text"
            autoComplete="username"
            maxLength={20}
            aria-invalid={!!usernameError}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              setUsernameError('')
            }}
            onBlur={() => username && checkUsername()}
          />
          {usernameError ? (
            <small role="alert" className="field-error">{usernameError}</small>
          ) : (
            <small>{USERNAME_HINT}</small>
          )}
        </label>
      )}
      <label>
        <span>Password</span>
        <div className="pw-field">
          <input
            type={show ? 'text' : 'password'}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            required
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="ghost eye"
            onClick={() => setShow(!show)}
            aria-label={show ? 'Hide password' : 'Show password'}
            aria-pressed={show}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
              {show && <path d="M4 20 20 4" />}
            </svg>
          </button>
        </div>
      </label>
      {!isLogin && <PasswordMeter password={password} />}
      {error && <p role="alert" className="error">{error}</p>}
      <button type="submit" className="primary" disabled={busy || (!isLogin && !meetsRules(password))}>
        {isLogin ? 'Log in' : 'Sign up'}
      </button>
      <p className="note">
        {isLogin ? (
          <>No account? <Link to="/register">Create one</Link></>
        ) : (
          <>Already registered? <Link to="/login">Log in</Link></>
        )}
      </p>
    </form>
  )
}
