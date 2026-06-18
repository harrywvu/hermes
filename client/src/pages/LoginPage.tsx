import { useMemo, useState } from 'react'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faEnvelope,
  faEye,
  faEyeSlash,
  faLock,
  faShieldHalved,
  faStar,
} from '@fortawesome/free-solid-svg-icons'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import hermesLogo from '../assets/hermes-logo.png'
import { useAuth } from '../auth/AuthContext'

type LoginFormValues = {
  email: string
  password: string
}

type LocationState = {
  from?: {
    pathname?: string
  }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isReady, login } = useAuth()
  const [submitError, setSubmitError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const destination = useMemo(
    () => (location.state as LocationState | null)?.from?.pathname ?? '/dashboard',
    [location.state],
  )

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    setSubmitError('')

    try {
      await login(values)
      navigate(destination, { replace: true })
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Unable to sign in right now.',
      )
    }
  }

  if (!isReady) {
    return <div className="route-loading">Loading workspace…</div>
  }

  if (isAuthenticated) {
    return <Navigate replace to={destination} />
  }

  return (
    <main className="auth-page">
      <div className="auth-backdrop" aria-hidden="true">
        <span className="orb orb-a" />
        <span className="orb orb-b" />
        <span className="orb orb-c" />
      </div>

      <section className="auth-shell auth-shell--split">
        <aside className="auth-marketing surface-card surface-card--elevated">
          <div className="brand-lockup brand-lockup--wide">
            <div className="brand-mark brand-mark--large" aria-hidden="true">
              <img alt="Hermes" src={hermesLogo} />
            </div>
            <div className="brand-copy">
              <p className="eyebrow">Hermes HRMS</p>
              <h1>Fast, precise workforce operations.</h1>
              <p>
                A premium HRMS workspace for employees, salaries, attendance, and payroll.
              </p>
            </div>
          </div>

          <div className="marketing-highlights">
            <div className="marketing-highlight">
              <span className="marketing-highlight-icon" aria-hidden="true">
                <FontAwesomeIcon icon={faStar} />
              </span>
              <div>
                <strong>Clean workflows</strong>
                <p>Focused surfaces and fast actions keep HR tasks low-friction.</p>
              </div>
            </div>
            <div className="marketing-highlight">
              <span className="marketing-highlight-icon" aria-hidden="true">
                <FontAwesomeIcon icon={faShieldHalved} />
              </span>
              <div>
                <strong>Protected access</strong>
                <p>JWT-backed sessions keep each workspace section private.</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="auth-card auth-card--login surface-card surface-card--elevated">
          <div className="auth-card-header">
            <p className="eyebrow">Sign in</p>
            <h2>Welcome back</h2>
            <p>Use the seeded admin account to enter the Hermes workspace.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
            <label className="field">
              <span className="field-label">Email</span>
              <div className="input-shell">
                <span className="input-icon" aria-hidden="true">
                  <FontAwesomeIcon icon={faEnvelope} />
                </span>
                <input
                  autoComplete="email"
                  placeholder="admin@test.com"
                  type="email"
                  {...register('email', {
                    required: 'Email is required.',
                  })}
                />
              </div>
              {errors.email ? <span className="field-error">{errors.email.message}</span> : null}
            </label>

            <label className="field">
              <span className="field-label">Password</span>
              <div className="input-shell">
                <span className="input-icon" aria-hidden="true">
                  <FontAwesomeIcon icon={faLock} />
                </span>
                <input
                  autoComplete="current-password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Password is required.',
                  })}
                />
                <button
                  className="input-action"
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {errors.password ? (
                <span className="field-error">{errors.password.message}</span>
              ) : null}
            </label>

            <button className="submit-button submit-button--wide" type="submit" disabled={isSubmitting}>
              <span>{isSubmitting ? 'Signing in' : 'Sign in to Hermes'}</span>
              <FontAwesomeIcon icon={faArrowRight} />
            </button>

            <div className="status-panel" aria-live="polite">
              {submitError ? (
                <p className="status status--error">{submitError}</p>
              ) : (
                <p className="status status--quiet">
                  Seeded admin credentials are ready for the workspace demo.
                </p>
              )}
            </div>
          </form>
        </section>
      </section>
    </main>
  )
}
