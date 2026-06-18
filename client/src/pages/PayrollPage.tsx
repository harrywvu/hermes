import { useEffect, useState } from 'react'
import {
  faExclamationTriangle,
  faMoneyBillWave,
} from '@fortawesome/free-solid-svg-icons'
import {
  ActionButton,
  Badge,
  EmptyState,
  DataTable,
  PageHeader,
  SectionCard,
} from '../components/ui'
import {
  fetchPayroll,
  formatMoney,
  formatDate,
  getErrorMessage,
  type PayrollRecord,
} from '../lib/hrms'

export default function PayrollPage() {
  const [records, setRecords] = useState<PayrollRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError('')

      try {
        const response = await fetchPayroll()
        if (!cancelled) {
          setRecords(response)
        }
      } catch (error) {
        if (!cancelled) {
          setError(getErrorMessage(error, 'Unable to load payroll records.'))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  if (isLoading) {
    return (
      <SectionCard>
        <div className="loading-grid loading-grid--payroll">
          <div className="loading-block loading-block--header" />
          <div className="loading-block loading-block--table" />
        </div>
      </SectionCard>
    )
  }

  if (error && records.length === 0) {
    return (
      <SectionCard>
        <EmptyState
          action={<ActionButton icon={faMoneyBillWave} onClick={() => window.location.reload()}>Retry</ActionButton>}
          description={error}
          icon={faExclamationTriangle}
          title="Payroll system unavailable"
        />
      </SectionCard>
    )
  }

  const totalNetSalary = records.reduce((sum, r) => sum + parseFloat(r.net_salary.toString()), 0)
  const recordsByDate = records.sort((a, b) => new Date(b.payroll_date).getTime() - new Date(a.payroll_date).getTime())

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Financial records"
        title="Payroll register"
        description="View payroll records for all employees. Read-only view of salary disbursements and deductions."
      />

      <section className="metric-grid metric-grid--compact">
        <SectionCard compact>
          <div className="mini-stat">
            <span className="mini-stat-label">Total records</span>
            <strong>{records.length}</strong>
            <p>Payroll entries across all periods</p>
          </div>
        </SectionCard>
        <SectionCard compact>
          <div className="mini-stat">
            <span className="mini-stat-label">Total net salary</span>
            <strong>{formatMoney(totalNetSalary)}</strong>
            <p>Sum of all net salaries</p>
          </div>
        </SectionCard>
        <SectionCard compact>
          <div className="mini-stat">
            <span className="mini-stat-label">Average net salary</span>
            <strong>{formatMoney(records.length > 0 ? totalNetSalary / records.length : 0)}</strong>
            <p>Per record average</p>
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Payroll history"
        description="Complete record of all payroll disbursements. Most recent entries appear first."
      >
        {records.length > 0 ? (
          <DataTable ariaLabel="Payroll register table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Basic salary</th>
                <th>Allowance</th>
                <th>Deductions</th>
                <th>Net salary</th>
                <th>Payroll date</th>
              </tr>
            </thead>
            <tbody>
              {recordsByDate.map((record) => (
                <tr key={record.id}>
                  <td>
                    <strong>{record.employee_name}</strong>
                  </td>
                  <td>{formatMoney(record.basic_salary)}</td>
                  <td>{formatMoney(record.allowance)}</td>
                  <td>−{formatMoney(record.deductions)}</td>
                  <td>
                    <strong className="payroll-net-salary">{formatMoney(record.net_salary)}</strong>
                  </td>
                  <td>
                    <Badge tone="neutral">{formatDate(record.payroll_date)}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        ) : (
          <EmptyState
            description="No payroll records have been generated yet."
            icon={faMoneyBillWave}
            title="No payroll records"
          />
        )}
      </SectionCard>
    </div>
  )
}
