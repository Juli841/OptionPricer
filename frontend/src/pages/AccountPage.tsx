import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/Avatar'
import { useAuth } from '../context/auth'
import { USERNAME_HINT, validUsername } from '../utils/username'

const TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_BYTES = 2 * 1024 * 1024 // keep in sync with the backend limit

export default function AccountPage() {
  const { user, avatarUrl, logout, setAvatar, clearAvatar, setUsername } = useAuth()
  const navigate = useNavigate()
  const fileInput = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [name, setName] = useState('')
  const [editing, setEditing] = useState(false)

  async function run(action: () => Promise<void>) {
    setError('')
    setBusy(true)
    try {
      await action()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown error')
    } finally {
      setBusy(false)
    }
  }

  function pick(file: File | undefined) {
    if (!file) return
    if (!TYPES.includes(file.type)) return setError('Choose a PNG, JPEG or WebP image')
    if (file.size > MAX_BYTES) return setError('The image must be under 2 MB')
    void run(() => setAvatar(file))
  }

  if (!user) return null

  return (
    <section className="card account">
      <Avatar src={avatarUrl} name={user.username ?? user.email} size={112} />
      <div className="account-main">
        <h2>{user.username ?? 'Account'}</h2>
        <p className="account-email">{user.email}</p>
        {editing ? (
          <form
            className="username-form"
            onSubmit={(e) => {
              e.preventDefault()
              if (!validUsername(name)) return setError(`Choose a username: ${USERNAME_HINT}`)
              void run(async () => {
                await setUsername(name)
                setEditing(false)
              })
            }}
          >
            <input
              aria-label="Username"
              autoComplete="username"
              maxLength={20}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button type="submit" className="primary" disabled={busy}>Save</button>
            <button type="button" onClick={() => setEditing(false)}>Cancel</button>
          </form>
        ) : (
          <button
            type="button"
            className="link"
            onClick={() => {
              setName(user.username ?? '')
              setError('')
              setEditing(true)
            }}
          >
            {user.username ? 'Change username' : 'Choose a username'}
          </button>
        )}
        <div className="account-actions">
          <input
            ref={fileInput}
            type="file"
            accept={TYPES.join(',')}
            hidden
            onChange={(e) => {
              pick(e.target.files?.[0])
              e.target.value = '' // lets the same file be picked again
            }}
          />
          <button type="button" disabled={busy} onClick={() => fileInput.current?.click()}>
            {avatarUrl ? 'Change photo' : 'Upload photo'}
          </button>
          {avatarUrl && (
            <button type="button" disabled={busy} onClick={() => void run(clearAvatar)}>
              Remove photo
            </button>
          )}
          <button
            type="button"
            onClick={async () => {
              await logout()
              navigate('/login')
            }}
          >
            Log out
          </button>
        </div>
        {error && <p role="alert" className="error">{error}</p>}
        <p className="note">PNG, JPEG or WebP, up to 2 MB.</p>
      </div>
    </section>
  )
}
