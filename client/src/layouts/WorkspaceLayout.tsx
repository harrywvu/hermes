import { useMemo } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendarDays,
  faChartPie,
  faMoneyBillWave,
  faPeopleGroup,
  faRectangleList,
  faRightFromBracket,
  faUserTag,
  faWaveSquare,
} from '@fortawesome/free-solid-svg-icons'
import hermesLogo from '../assets/hermes-logo.png'
import { useAuth } from '../auth/AuthContext'

const links = [
  { to: '/dashboard', label: 'Dashboard', hint: 'Overview', icon: faChartPie },
  { to: '/employees', label: 'Employees', hint: 'Directory', icon: faPeopleGroup },
  { to: '/salary', label: 'Salary', hint: 'Compensation', icon: faMoneyBillWave },
  { to: '/attendance', label: 'Attendance', hint: 'Tracking', icon: faCalendarDays },
  { to: '/payroll', label: 'Payroll', hint: 'Payouts', icon: faRectangleList },
]

const titleMap: Record<string, { eyebrow: string; title: string; description: string }> = {
  '/dashboard': {
    eyebrow: 'Hermes dashboard',
    title: 'Operational overview',
    description: 'Monitor headcount, active staff, leave status, and payroll totals.',
  },
  '/employees': {
    eyebrow: 'People operations',
    title: 'Employee directory',
    description: 'Create, update, and remove employee records from a clean workspace view.',
  },
  '/salary': {
    eyebrow: 'Compensation',
    title: 'Salary management',
    description: 'Assign and update salary packages per employee with payroll sync.',
  },
  '/attendance': {
    eyebrow: 'Time tracking',
    title: 'Attendance log',
    description: 'Record daily attendance and review recent presence data.',
  },
  '/payroll': {
    eyebrow: 'Payroll operations',
    title: 'Payroll register',
    description: 'Inspect payroll history with employee names and computed net salaries.',
  },
}

export default function WorkspaceLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user } = useAuth()
  const currentRoute = useMemo(() => {
    return titleMap[location.pathname] ?? titleMap['/dashboard']
  }, [location.pathname])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <img alt="Hermes" src={hermesLogo} />
          <div>
            <strong>Hermes</strong>
            <span>HRMS workspace</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Workspace sections">
          {links.map((link) => (
            <NavLink
              key={link.to}
              className={({ isActive }) =>
                `sidebar-tab${isActive ? ' is-active' : ''}`
              }
              to={link.to}
            >
              <span className="sidebar-tab-icon" aria-hidden="true">
                <FontAwesomeIcon icon={link.icon} />
              </span>
              <span className="sidebar-tab-copy">
                <strong>{link.label}</strong>
                <small>{link.hint}</small>
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p>Signed in as</p>
          <strong>{user?.email ?? 'Unknown user'}</strong>
          <button className="secondary-button secondary-button--full" type="button" onClick={handleLogout}>
            <FontAwesomeIcon icon={faRightFromBracket} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-topbar">
          <div>
            <p className="eyebrow">{currentRoute.eyebrow}</p>
            <h1>{currentRoute.title}</h1>
            <p className="topbar-description">{currentRoute.description}</p>
          </div>
          <div className="topbar-meta">
            <span className="status-pill status-pill--soft">
              <FontAwesomeIcon icon={faWaveSquare} />
              <span>Connected</span>
            </span>
            <span className="topbar-email">
              <FontAwesomeIcon icon={faUserTag} />
              <span>{user?.email ?? 'No session'}</span>
            </span>
          </div>
        </header>

        <Outlet />
      </section>
    </main>
  )
}
