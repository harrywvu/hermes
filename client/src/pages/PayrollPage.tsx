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
  const [filteredRecords, setFilteredRecords] = useState<PayrollRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'today' | 'week' | 'month' | 'all'>('all')

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

  useEffect(() => {
    // Apply filter when records or filter changes
    let filtered = [...records]
    
    if (filter === 'today') {
      const today = new Date().toDateString()
      filtered = filtered.filter(record => new Date(record.payroll_date).toDateString() === today)
    } else if (filter === 'week') {
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.payroll_date)
        return recordDate >= startOfWeek && recordDate <= endOfWeek
      })
    } else if (filter === 'month') {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth()
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.payroll_date)
        return recordDate.getFullYear() === year && recordDate.getMonth() === month
      })
    }
    
    setFilteredRecords(filtered)
  }, [records, filter])

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

  const totalNetSalary = filteredRecords.reduce((sum, r) => sum + parseFloat(r.net_salary.toString()), 0)
  const recordsByDate = filteredRecords.sort((a, b) => new Date(b.payroll_date).getTime() - new Date(a.payroll_date).getTime())

  return (
    <div className="page-stack">

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
        actions={
          <div className="filter-controls">
            <select 
              className="filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="all">All time</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
            </select>
          </div>
        }
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
