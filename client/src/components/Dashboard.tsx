import { useMemo, useState } from 'react'
import hermesLogo from '../assets/hermes-logo.png'

type DashboardTab = 'employees' | 'salary' | 'attendance' | 'payroll' | 'settings'

const tabs: Array<{ id: DashboardTab; label: string; hint: string }> = [
  { id: 'employees', label: 'Employees', hint: 'Directory and profiles' },
  { id: 'salary', label: 'Salary', hint: 'Compensation setup' },
  { id: 'attendance', label: 'Attendance', hint: 'Daily tracking' },
  { id: 'payroll', label: 'Payroll', hint: 'Monthly payouts' },
  { id: 'settings', label: 'Settings', hint: 'Workspace controls' },
]

type DashboardProps = {
  email: string
  onLogout: () => void
}

function DashboardSection({ activeTab }: { activeTab: DashboardTab }) {
  const copy = useMemo(() => {
    switch (activeTab) {
      case 'employees':
        return {
          title: 'Employees',
          description:
            'Scaffold the employee directory, CRUD actions, and profile details here.',
        }
      case 'salary':
        return {
          title: 'Salary',
          description:
            'Place salary assignment and edit workflows in this section.',
        }
      case 'attendance':
        return {
          title: 'Attendance',
          description:
            'Use this area for attendance entry forms and monthly records.',
        }
      case 'payroll':
        return {
          title: 'Payroll',
          description:
            'Surface payroll summaries and generated net salary rows here.',
        }
      case 'settings':
        return {
          title: 'Settings',
          description:
            'Workspace preferences, user settings, and system controls belong here.',
        }
    }
  }, [activeTab])

  return (
    <section className="dashboard-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Workspace overview</p>
          <h2>{copy.title}</h2>
        </div>
        <button className="secondary-button" type="button">
          Add card
        </button>
      </div>

      <div className="metric-grid">
        <article className="metric-card">
          <span>Employees</span>
          <strong>05</strong>
          <small>Seeded directory</small>
        </article>
        <article className="metric-card">
          <span>Active</span>
          <strong>03</strong>
          <small>Currently on duty</small>
        </article>
        <article className="metric-card">
          <span>On Leave</span>
          <strong>01</strong>
          <small>Temporary leave</small>
        </article>
        <article className="metric-card">
          <span>Payroll</span>
          <strong>00</strong>
          <small>Waiting on salary data</small>
        </article>
      </div>

      <article className="content-card">
        <p className="eyebrow">Selected module</p>
        <h3>{copy.title}</h3>
        <p>{copy.description}</p>

        <div className="placeholder-row" aria-hidden="true">
          <span className="placeholder-line" />
          <span className="placeholder-line short" />
          <span className="placeholder-line" />
          <span className="placeholder-line mid" />
        </div>
      </article>
    </section>
  )
}

export default function Dashboard({ email, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('employees')

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

        <nav className="sidebar-nav" aria-label="Dashboard sections">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab

            return (
              <button
                key={tab.id}
                className={`sidebar-tab${isActive ? ' is-active' : ''}`}
                type="button"
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="sidebar-tab-copy">
                  <strong>{tab.label}</strong>
                  <small>{tab.hint}</small>
                </span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <p>Signed in as</p>
          <strong>{email}</strong>
          <button className="secondary-button" type="button" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-topbar">
          <div>
            <p className="eyebrow">Hermes dashboard</p>
            <h1>Operational scaffold</h1>
          </div>
          <div className="topbar-meta">
            <span className="status-pill">Connected</span>
            <span className="topbar-email">{email}</span>
          </div>
        </header>

        <DashboardSection activeTab={activeTab} />
      </section>
    </main>
  )
}
