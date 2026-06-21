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
    setValue,
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

  function fillDemoCredentials() {
    setValue('email', 'admin@test.com', { shouldValidate: false })
    setValue('password', 'admin123', { shouldValidate: false })
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

      <section className="auth-shell">
        <div className="login-container">
          <aside className="login-brand">
            <div className="login-brand-content">
              <div className="brand-mark" aria-hidden="true">
                <img alt="Hermes" src={hermesLogo} />
              </div>
              <h1 className="login-brand-title">Hermes</h1>
              <p className="login-brand-tagline">
                Fast, precise workforce operations.
              </p>
              <p className="login-brand-desc">
                A premium HRMS workspace for employees, salaries, attendance, and payroll.
              </p>

              <div className="login-features">
                <div className="login-feature">
                  <span className="login-feature-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faStar} />
                  </span>
                  <div>
                    <strong>Clean workflows</strong>
                    <p>Focused surfaces and fast actions keep HR tasks low-friction.</p>
                  </div>
                </div>
                <div className="login-feature">
                  <span className="login-feature-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faShieldHalved} />
                  </span>
                  <div>
                    <strong>Protected access</strong>
                    <p>JWT-backed sessions keep each workspace section private.</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="login-form-panel">
            <div className="login-form-header">
              <p className="eyebrow">Sign in</p>
              <h2>Welcome back</h2>
              <p>Sign in to access the Hermes workspace.</p>

              <button className="demo-btn" type="button" onClick={fillDemoCredentials}>
                Use demo credentials
              </button>
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
                    placeholder="you@example.com"
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
                    placeholder="Enter your password"
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
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
