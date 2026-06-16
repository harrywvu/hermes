import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import Dashboard from './components/Dashboard'
import hermesLogo from './assets/hermes-logo.png'
import './App.css'

type LoginResponse = {
  access_token: string
  token_type: string
  admin_id: number
  email: string
}

const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:8000'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [notice, setNotice] = useState<{
    type: 'success' | 'error' | 'idle'
    message: string
  }>({
    type: 'idle',
    message: '',
  })
  const [session, setSession] = useState<LoginResponse | null>(null)

  useEffect(() => {
    const savedEmail = localStorage.getItem('hermes_login_email')
    if (savedEmail) {
      setEmail(savedEmail)
    }

    const token = localStorage.getItem('hermes_token')
    const savedAdminEmail = localStorage.getItem('hermes_admin_email')
    if (token && savedAdminEmail) {
      setIsAuthenticated(true)
      setSession({
        access_token: token,
        token_type: 'bearer',
        admin_id: Number(localStorage.getItem('hermes_admin_id') ?? '1'),
        email: savedAdminEmail,
      })
    }
  }, [])

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.trim().length > 0 && !isSubmitting,
    [email, isSubmitting, password],
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    setIsSubmitting(true)
    setNotice({ type: 'idle', message: '' })

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      })

      const payload = (await response.json().catch(() => null)) as
        | LoginResponse
        | { detail?: string }
        | null

      if (!response.ok || !payload || !('access_token' in payload)) {
        throw new Error(
          (payload && 'detail' in payload && payload.detail) ||
            'Unable to sign in right now.',
        )
      }

      const login = payload as LoginResponse
      setSession(login)
      setIsAuthenticated(true)
      setNotice({
        type: 'success',
        message: `Signed in as ${login.email}.`,
      })

      localStorage.setItem('hermes_token', login.access_token)
      localStorage.setItem('hermes_admin_email', login.email)
      localStorage.setItem('hermes_admin_id', String(login.admin_id))
      if (rememberMe) {
        localStorage.setItem('hermes_login_email', login.email)
      } else {
        localStorage.removeItem('hermes_login_email')
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Login request failed.'
      setNotice({ type: 'error', message })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('hermes_token')
    localStorage.removeItem('hermes_admin_email')
    localStorage.removeItem('hermes_admin_id')
    setSession(null)
    setIsAuthenticated(false)
    setPassword('')
    setNotice({ type: 'idle', message: '' })
  }

  if (isAuthenticated && session) {
    return <Dashboard email={session.email} onLogout={handleLogout} />
  }

  return (
    <main className="auth-page">
      <div className="auth-backdrop" aria-hidden="true">
        <span className="orb orb-a" />
        <span className="orb orb-b" />
        <span className="orb orb-c" />
      </div>

      <section className="auth-shell">
        <div className="auth-card">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true">
              <img alt="Hermes" src={hermesLogo} />
            </div>
            <div className="brand-copy">
              <h1>Hermes</h1>
              <p>Sign in to your workspace</p>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field">
              <span className="field-label">Email</span>
              <div className="input-shell">
                <span className="input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path
                      d="M4 6.5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Zm0 1.9V17h16V8.4l-8 5-8-5Zm8 3.1 8-5H4l8 5Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <input
                  autoComplete="email"
                  name="email"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </label>

            <div className="field-row">
              <label className="field field--password">
                <span className="field-label">Password</span>
                <div className="input-shell">
                  <span className="input-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path
                        d="M17 10.5V8a5 5 0 0 0-10 0v2.5H5.8A1.8 1.8 0 0 0 4 12.3v7.4A1.8 1.8 0 0 0 5.8 21.5h12.4a1.8 1.8 0 0 0 1.8-1.8v-7.4a1.8 1.8 0 0 0-1.8-1.8H17Zm-8-2.5a3 3 0 0 1 6 0v2.5H9V8Zm3 4.5a1.5 1.5 0 0 1 .8 2.8V17h-1.6v-1.7A1.5 1.5 0 0 1 12 12.5Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  <input
                    autoComplete="current-password"
                    name="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    className="input-action"
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <svg viewBox="0 0 24 24" focusable="false">
                      {showPassword ? (
                        <path
                          d="M3.5 12s3.5-6.5 8.5-6.5 8.5 6.5 8.5 6.5-3.5 6.5-8.5 6.5S3.5 12 3.5 12Zm8.5-3.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm0 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"
                          fill="currentColor"
                        />
                      ) : (
                        <path
                          d="M4.1 5.3 5.5 4l14.5 14.5-1.4 1.4-2-2a11.6 11.6 0 0 1-4.6.9c-5 0-8.5-6.5-8.5-6.5a17.3 17.3 0 0 1 4.2-4.7l-1.6-1.6ZM12 8.5c-1 0-1.9.4-2.5 1l1.2 1.2a1.5 1.5 0 0 1 2.1 2.1l1.2 1.2c.7-.7 1-1.5 1-2.5a3.5 3.5 0 0 0-3-3.5Zm-6.5 3.5s3 5 6.5 5c1.1 0 2.2-.2 3.2-.6l-1.4-1.4c-.5.2-1.1.3-1.8.3a3.5 3.5 0 0 1-3.5-3.5c0-.7.1-1.3.3-1.8l-1.5-1.5a18.1 18.1 0 0 0-1.8 3.5Zm17 0s-1.3 2.3-3.4 4l-1.4-1.4c1.6-1.3 2.7-2.9 2.7-2.9s-3-5-6.5-5c-.5 0-1 .1-1.5.2L10 8.3c.6-.2 1.3-.3 2-.3 5 0 8.5 6.5 8.5 6.5Z"
                          fill="currentColor"
                        />
                      )}
                    </svg>
                  </button>
                </div>
              </label>

              <a className="text-link" href="mailto:it@hermes.local">
                Forgot password?
              </a>
            </div>

            <label className="remember">
              <input
                checked={rememberMe}
                type="checkbox"
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span>Remember me for 30 days</span>
            </label>

            <button className="submit-button" type="submit" disabled={!canSubmit}>
              <span>{isSubmitting ? 'Signing in' : 'Sign in'}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M13.2 5.2 19 11l-5.8 5.8-1.4-1.4 3.4-3.4H5v-2h10.2l-3.4-3.4 1.4-1.4Z"
                  fill="currentColor"
                />
              </svg>
            </button>

            <div className="status-panel" aria-live="polite">
              {notice.type !== 'idle' ? (
                <p className={`status status--${notice.type}`}>{notice.message}</p>
              ) : session ? (
                <p className="status status--success">
                  Session stored for {session.email}.
                </p>
              ) : (
                <p className="status status--quiet">
                  Use the seeded admin account: admin@test.com
                </p>
              )}
            </div>
          </form>

          <div className="auth-divider" aria-hidden="true" />

          <p className="auth-footer">
            Don&apos;t have an account? <a href="mailto:it@hermes.local">Contact IT</a>
          </p>
        </div>
      </section>
    </main>
  )
}

export default App
