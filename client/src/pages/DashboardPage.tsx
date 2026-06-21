import { useEffect, useMemo, useState } from 'react'
import {
  faChartLine,
  faMoneyBillWave,
  faTriangleExclamation,
  faUserCheck,
  faUserClock,
  faUsers,
  faCalendarAlt,
  faFileInvoiceDollar,
} from '@fortawesome/free-solid-svg-icons'
import { ActionButton, Badge, EmptyState, MetricCard, SectionCard } from '../components/ui'
import {
  fetchDashboard,
  formatMoney,
  getErrorMessage,
  type DashboardResponse,
} from '../lib/hrms'

function LoadingState() {
  return (
    <SectionCard>
      <div className="loading-grid">
        <div className="loading-block loading-block--header" />
        <div className="loading-block loading-block--metric" />
        <div className="loading-block loading-block--metric" />
        <div className="loading-block loading-block--metric" />
        <div className="loading-block loading-block--metric" />
      </div>
    </SectionCard>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      setIsLoading(true)
      setError('')

      try {
        const response = await fetchDashboard()
        if (!cancelled) {
          setData(response)
        }
      } catch (error) {
        if (!cancelled) {
          setError(getErrorMessage(error, 'Unable to load the dashboard right now.'))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      cancelled = true
    }
  }, [])

  const activeRatio = useMemo(() => {
    if (!data || data.total_employees === 0) {
      return 0
    }

    return Math.round((data.active_employees / data.total_employees) * 100)
  }, [data])

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return (
      <SectionCard>
        <EmptyState
          action={<ActionButton icon={faChartLine} onClick={() => window.location.reload()}>Retry</ActionButton>}
          description={error}
          icon={faTriangleExclamation}
          title="Dashboard unavailable"
        />
      </SectionCard>
    )
  }

  if (!data) {
    return null
  }

  function statusTone(status: string) {
    switch (status) {
      case 'Present':
        return 'success'
      case 'Late':
        return 'warning'
      case 'Absent':
        return 'danger'
      case 'On Leave':
        return 'info'
      default:
        return 'neutral'
    }
  }

  return (
    <div className="page-stack">

      <section className="metric-grid metric-grid--dashboard">
        <MetricCard
          accentClassName="metric-card--blue"
          hint="Total employees in the directory"
          icon={faUsers}
          label="Total employees"
          value={String(data.total_employees)}
        />
        <MetricCard
          accentClassName="metric-card--green"
          hint="Currently marked active"
          icon={faUserCheck}
          label="Active employees"
          value={String(data.active_employees)}
        />
        <MetricCard
          accentClassName="metric-card--amber"
          hint="Employees on leave"
          icon={faUserClock}
          label="Employees on leave"
          value={String(data.employees_on_leave)}
        />
        <MetricCard
          accentClassName="metric-card--violet"
          hint="Computed monthly payroll total"
          icon={faMoneyBillWave}
          label="Monthly payroll"
          value={formatMoney(data.total_monthly_payroll)}
        />
      </section>

      <SectionCard
        title="Workforce health"
        description="A quick operational snapshot based on the current employee and payroll data."
        actions={
          <Badge tone={activeRatio >= 70 ? 'success' : activeRatio >= 40 ? 'warning' : 'danger'}>
            {activeRatio}% active
          </Badge>
        }
      >
        <div className="dashboard-insights">
          <div className="progress-panel">
            <div className="progress-panel-top">
              <span>Active employee ratio</span>
              <strong>{activeRatio}%</strong>
            </div>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-fill" style={{ width: `${activeRatio}%` }} />
            </div>
          </div>

          <div className="insight-list">
            <article className="insight-card">
              <strong>Employee directory</strong>
              <p>{data.total_employees} total employee records ready for management.</p>
            </article>
            <article className="insight-card">
              <strong>Payroll snapshot</strong>
              <p>{formatMoney(data.total_monthly_payroll)} in computed monthly payroll.</p>
            </article>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Recent Activity"
        description="Latest attendance and payroll entries"
      >
        <div className="activity-grid">
          <div className="activity-column">
            <h3 className="activity-title">Recent Attendance</h3>
            {data.recent_attendance.length > 0 ? (
              <div className="activity-list">
                {data.recent_attendance.map((record, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-info">
                      <strong className="activity-name">{record.employee_name}</strong>
                      <span className="activity-date">{record.date}</span>
                    </div>
                    <Badge tone={statusTone(record.status)}>
                      {record.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                description="No attendance records yet"
                icon={faCalendarAlt}
                title="No recent attendance"
              />
            )}
          </div>
          
          <div className="activity-column">
            <h3 className="activity-title">Recent Payroll</h3>
            {data.recent_payroll.length > 0 ? (
              <div className="activity-list">
                {data.recent_payroll.map((record, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-info">
                      <strong className="activity-name">{record.employee_name}</strong>
                      <span className="activity-date">{record.payroll_date}</span>
                    </div>
                    <strong className="activity-amount">{formatMoney(record.net_salary)}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                description="No payroll records yet"
                icon={faFileInvoiceDollar}
                title="No recent payroll"
              />
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
