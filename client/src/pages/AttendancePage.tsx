import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendarDays,
  faExclamationTriangle,
  faPlus,
  faUsers,
  faClock,
} from '@fortawesome/free-solid-svg-icons'
import {
  ActionButton,
  Badge,
  EmptyState,
  DataTable,
  SectionCard,
} from '../components/ui'
import {
  createAttendance,
  fetchAttendance,
  fetchEmployees,
  formatDate,
  formatDateTime,
  getErrorMessage,
  type AttendanceRecord,
  type Employee,
} from '../lib/hrms'

type AttendanceFormValues = {
  employee_id: string
  date: string
  time_in: string
  time_out: string
  status: 'Present' | 'Late' | 'Absent' | 'On Leave'
}

const statusOptions = ['Present', 'Late', 'Absent', 'On Leave'] as const

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

function emptyValues(): AttendanceFormValues {
  return {
    employee_id: '',
    date: new Date().toISOString().slice(0, 10),
    time_in: '',
    time_out: '',
    status: 'Present',
  }
}

export default function AttendancePage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [filter, setFilter] = useState<'today' | 'week' | 'month' | 'all'>('all')

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<AttendanceFormValues>({
    mode: 'onTouched',
    defaultValues: emptyValues(),
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError('')

      try {
        const [empResponse, attResponse] = await Promise.all([
          fetchEmployees(),
          fetchAttendance(),
        ])

        if (!cancelled) {
          setEmployees(empResponse)
          setRecords(attResponse)
        }
      } catch (error) {
        if (!cancelled) {
          setError(getErrorMessage(error, 'Unable to load attendance records.'))
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
      filtered = filtered.filter(record => new Date(record.date).toDateString() === today)
    } else if (filter === 'week') {
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date)
        return recordDate >= startOfWeek && recordDate <= endOfWeek
      })
    } else if (filter === 'month') {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth()
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date)
        return recordDate.getFullYear() === year && recordDate.getMonth() === month
      })
    }
    
    setFilteredRecords(filtered)
  }, [records, filter])

  function resetForm() {
    setNotice('')
    reset(emptyValues())
  }

  const onSubmit = handleSubmit(async (values) => {
    setIsSaving(true)
    setNotice('')

    try {
      const payload = {
        employee_id: parseInt(values.employee_id),
        date: values.date,
        time_in: values.time_in ? `${values.date}T${values.time_in}:00` : null,
        time_out: values.time_out ? `${values.date}T${values.time_out}:00` : null,
        status: values.status,
      }

      await createAttendance(payload)
      setNotice('Attendance record created successfully.')

      // Refresh records
      const updated = await fetchAttendance()
      setRecords(updated)
      resetForm()
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to save attendance record.'))
    } finally {
      setIsSaving(false)
    }
  })

  if (isLoading) {
    return (
      <SectionCard>
        <div className="loading-grid loading-grid--employees">
          <div className="loading-block loading-block--header" />
          <div className="loading-block loading-block--table" />
          <div className="loading-block loading-block--panel" />
        </div>
      </SectionCard>
    )
  }

  if (error && records.length === 0) {
    return (
      <SectionCard>
        <EmptyState
          action={<ActionButton icon={faUsers} onClick={() => window.location.reload()}>Retry</ActionButton>}
          description={error}
          icon={faExclamationTriangle}
          title="Attendance system unavailable"
        />
      </SectionCard>
    )
  }

  const recordsByDate = filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="page-stack">

      <section className="metric-grid metric-grid--compact">
        <SectionCard compact>
          <div className="mini-stat">
            <span className="mini-stat-label">Total records</span>
            <strong>{records.length}</strong>
            <p>Attendance entries logged</p>
          </div>
        </SectionCard>
        <SectionCard compact>
          <div className="mini-stat">
            <span className="mini-stat-label">Present today</span>
            <strong>{records.filter((r) => new Date(r.date).toDateString() === new Date().toDateString() && r.status === 'Present').length}</strong>
            <p>Marked present today</p>
          </div>
        </SectionCard>
        <SectionCard compact>
          <div className="mini-stat">
            <span className="mini-stat-label">On leave / absent</span>
            <strong>{records.filter((r) => new Date(r.date).toDateString() === new Date().toDateString() && (r.status === 'On Leave' || r.status === 'Absent')).length}</strong>
            <p>Out today</p>
          </div>
        </SectionCard>
      </section>

      <div className="split-layout">
        <SectionCard
          title="Attendance records"
          description="View recent attendance history. Most recent entries appear first."
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
            <DataTable ariaLabel="Attendance records table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Time in</th>
                  <th>Time out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recordsByDate.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <strong>{record.employee_name}</strong>
                    </td>
                    <td>{formatDate(record.date)}</td>
                    <td>{record.time_in ? formatDateTime(record.time_in) : '—'}</td>
                    <td>{record.time_out ? formatDateTime(record.time_out) : '—'}</td>
                    <td>
                      <Badge tone={statusTone(record.status)}>
                        {record.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          ) : (
            <EmptyState
              description="No attendance records have been logged yet."
              icon={faCalendarDays}
              title="No records"
            />
          )}
        </SectionCard>

        <SectionCard
          title="Log attendance"
          description="Create a new attendance record for an employee. All fields are optional except the date."
          actions={
            <Badge tone="neutral">Create mode</Badge>
          }
        >
          <form className="form-grid" onSubmit={onSubmit}>
            <label className="field">
              <span className="field-label">Employee</span>
              <select className="select-field" {...register('employee_id', { required: 'Please select an employee.' })}>
                <option value="">— Select an employee —</option>
                {employees.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.full_name}
                  </option>
                ))}
              </select>
              {errors.employee_id ? (
                <span className="field-error">{errors.employee_id.message}</span>
              ) : null}
            </label>

            <label className="field">
              <span className="field-label">Date</span>
              <div className="input-shell">
                <span className="input-icon" aria-hidden="true">
                  <FontAwesomeIcon icon={faCalendarDays} />
                </span>
                <input
                  type="date"
                  {...register('date', { required: 'Date is required.' })}
                />
              </div>
              {errors.date ? (
                <span className="field-error">{errors.date.message}</span>
              ) : null}
            </label>

            <label className="field">
              <span className="field-label">Time in</span>
              <div className="input-shell">
                <span className="input-icon" aria-hidden="true">
                  <FontAwesomeIcon icon={faClock} />
                </span>
                <input
                  type="time"
                  {...register('time_in')}
                />
              </div>
            </label>

            <label className="field">
              <span className="field-label">Time out</span>
              <div className="input-shell">
                <span className="input-icon" aria-hidden="true">
                  <FontAwesomeIcon icon={faClock} />
                </span>
                <input
                  type="time"
                  {...register('time_out', {
                    validate: (value) => {
                      if (!value) return true
                      const timeIn = getValues('time_in')
                      if (!timeIn) return true
                      return value > timeIn || 'Time out must be after time in'
                    },
                  })}
                />
              </div>
              {errors.time_out ? (
                <span className="field-error">{errors.time_out.message}</span>
              ) : null}
            </label>

            <label className="field">
              <span className="field-label">Status</span>
              <select className="select-field" {...register('status')}>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <div className="form-actions">
              <button className="submit-button" type="submit" disabled={isSaving}>
                <span>{isSaving ? 'Logging' : 'Log attendance'}</span>
                <FontAwesomeIcon icon={faPlus} />
              </button>
              <button className="secondary-button" type="button" onClick={resetForm}>
                Reset form
              </button>
            </div>
          </form>

          {notice ? <p className="inline-status inline-status--success">{notice}</p> : null}
          {error && records.length > 0 ? <p className="inline-status inline-status--error">{error}</p> : null}
        </SectionCard>
      </div>
    </div>
  )
}
