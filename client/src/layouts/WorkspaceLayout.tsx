import { useState, useRef, useEffect, useMemo } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendarDays,
  faChartPie,
  faMoneyBillWave,
  faPeopleGroup,
  faRectangleList,
  faRightFromBracket,
  faBell,
  faCircleUser,
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

const pageNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/employees': 'Employees',
  '/salary': 'Salary',
  '/attendance': 'Attendance',
  '/payroll': 'Payroll',
}

type Activity = {
  id: number
  text: string
  time: string
  type: 'employee' | 'attendance' | 'salary' | 'payroll'
}

const mockActivities: Activity[] = [
  { id: 1, text: 'Ava Santos was added to the directory.', time: '10 mins ago', type: 'employee' },
  { id: 2, text: 'Noah Reyes logged attendance for today.', time: '1 hour ago', type: 'attendance' },
  { id: 3, text: 'Mia Cruz salary package was updated.', time: '2 hours ago', type: 'salary' },
  { id: 4, text: 'Liam Flores was marked Present.', time: '4 hours ago', type: 'attendance' },
  { id: 5, text: 'Admin generated payroll records for June.', time: '1 day ago', type: 'payroll' },
]

export default function WorkspaceLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user } = useAuth()

  const [showActivities, setShowActivities] = useState(false)
  const [activities, setActivities] = useState<Activity[]>(mockActivities)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentPageName = useMemo(() => {
    return pageNames[location.pathname] ?? 'Workspace'
  }, [location.pathname])

  const userName = useMemo(() => {
    if (!user?.email) return 'Admin'
    const namePart = user.email.split('@')[0]
    return namePart.charAt(0).toUpperCase() + namePart.slice(1)
  }, [user])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function handleClearActivities() {
    setActivities([])
  }

  // Handle clicking outside the activities dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowActivities(false)
      }
    }

    if (showActivities) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showActivities])

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
        <nav className="workspace-navbar" aria-label="Workspace topbar">
          <div className="navbar-left">
            <h1 className="navbar-title">{currentPageName}</h1>
          </div>
          <div className="navbar-right">
            <span className="navbar-greeting">
              Hello, <strong>{userName}</strong>!
            </span>

            <div className="navbar-activities-container" ref={dropdownRef}>
              <button
                className="navbar-icon-btn"
                type="button"
                onClick={() => setShowActivities((prev) => !prev)}
                aria-label="Toggle recent activities menu"
              >
                <FontAwesomeIcon icon={faBell} />
                {activities.length > 0 && <span className="badge-dot" />}
              </button>

              {showActivities && (
                <div className="activities-dropdown">
                  <div className="dropdown-header">
                    <h4>Recent Activities</h4>
                    {activities.length > 0 && (
                      <button
                        className="dropdown-clear-btn"
                        type="button"
                        onClick={handleClearActivities}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <ul className="activities-list">
                    {activities.length > 0 ? (
                      activities.map((activity) => (
                        <li key={activity.id} className="activity-item">
                          <span className={`activity-dot ${activity.type}`} />
                          <div className="activity-content">
                            <p>{activity.text}</p>
                            <small>{activity.time}</small>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="activity-empty">No recent activities.</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div className="navbar-avatar" title="User settings" role="button" tabIndex={0}>
              <FontAwesomeIcon icon={faCircleUser} />
            </div>
          </div>
        </nav>

        <Outlet />
      </section>
    </main>
  )
}
