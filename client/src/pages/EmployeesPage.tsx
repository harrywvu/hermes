import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBuilding,
  faCalendarDays,
  faEnvelope,
  faExclamationTriangle,
  faPenToSquare,
  faPhone,
  faPlus,
  faTrashCan,
  faUserCheck,
  faUserTie,
  faUsers,
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
  createEmployee,
  deleteEmployee,
  fetchEmployees,
  formatDate,
  getErrorMessage,
  type Employee,
  type EmployeeCreatePayload,
  type EmploymentStatus,
  updateEmployee,
} from '../lib/hrms'

type EmployeeFormValues = {
  full_name: string
  email: string
  contact_number: string
  department: string
  position: string
  date_hired: string
  employment_status: EmploymentStatus
}

const statusOptions: EmploymentStatus[] = ['Active', 'On Leave', 'Resigned']

function statusTone(status: EmploymentStatus) {
  switch (status) {
    case 'Active':
      return 'success'
    case 'On Leave':
      return 'warning'
    case 'Resigned':
      return 'danger'
  }
}

function emptyValues(): EmployeeFormValues {
  return {
    full_name: '',
    email: '',
    contact_number: '',
    department: '',
    position: '',
    date_hired: '',
    employment_status: 'Active',
  }
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    mode: 'onTouched',
    defaultValues: emptyValues(),
  })

  const employeeCount = employees.length
  const activeCount = useMemo(
    () => employees.filter((employee) => employee.employment_status === 'Active').length,
    [employees],
  )

  useEffect(() => {
    let cancelled = false

    async function loadEmployees() {
      setIsLoading(true)
      setError('')

      try {
        const response = await fetchEmployees()
        if (!cancelled) {
          setEmployees(response)
        }
      } catch (error) {
        if (!cancelled) {
          setError(getErrorMessage(error, 'Unable to load employees right now.'))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadEmployees()

    return () => {
      cancelled = true
    }
  }, [])

  function beginCreate() {
    setSelectedEmployee(null)
    setNotice('')
    reset(emptyValues())
  }

  function beginEdit(employee: Employee) {
    setSelectedEmployee(employee)
    setNotice('')
    reset({
      full_name: employee.full_name,
      email: employee.email,
      contact_number: employee.contact_number ?? '',
      department: employee.department,
      position: employee.position,
      date_hired: employee.date_hired.slice(0, 10),
      employment_status: employee.employment_status,
    })
  }

  async function refreshEmployees() {
    const response = await fetchEmployees()
    setEmployees(response)
  }

  const onSubmit = handleSubmit(async (values) => {
    setIsSaving(true)
    setNotice('')

    const payload: EmployeeCreatePayload = {
      full_name: values.full_name.trim(),
      email: values.email.trim(),
      contact_number: values.contact_number.trim() || null,
      department: values.department.trim(),
      position: values.position.trim(),
      date_hired: values.date_hired,
      employment_status: values.employment_status,
    }

    try {
      if (selectedEmployee) {
        await updateEmployee(selectedEmployee.employee_id, payload)
        setNotice('Employee updated successfully.')
      } else {
        await createEmployee(payload)
        setNotice('Employee created successfully.')
      }

      await refreshEmployees()
      beginCreate()
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to save the employee right now.'))
    } finally {
      setIsSaving(false)
    }
  })

  async function handleDelete(employee: Employee) {
    const confirmed = window.confirm(`Delete ${employee.full_name}? This will cascade to salary, attendance, and payroll records.`)
    if (!confirmed) {
      return
    }

    setError('')
    setNotice('')

    try {
      await deleteEmployee(employee.employee_id)
      await refreshEmployees()
      if (selectedEmployee?.employee_id === employee.employee_id) {
        beginCreate()
      }
      setNotice('Employee deleted successfully.')
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to delete the employee right now.'))
    }
  }

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

  if (error && employees.length === 0) {
    return (
      <SectionCard>
        <EmptyState
          action={<ActionButton icon={faUsers} onClick={() => window.location.reload()}>Retry</ActionButton>}
          description={error}
          icon={faExclamationTriangle}
          title="Employee directory unavailable"
        />
      </SectionCard>
    )
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="People operations"
        title="Employees"
        description="Create, update, and delete employees from the workspace directory."
        actions={<ActionButton icon={faPlus} onClick={beginCreate}>Add employee</ActionButton>}
      />

      <section className="metric-grid metric-grid--compact">
        <SectionCard compact>
          <div className="mini-stat">
            <span className="mini-stat-label">Employees</span>
            <strong>{employeeCount}</strong>
            <p>Total records in the directory</p>
          </div>
        </SectionCard>
        <SectionCard compact>
          <div className="mini-stat">
            <span className="mini-stat-label">Active</span>
            <strong>{activeCount}</strong>
            <p>Currently marked as active</p>
          </div>
        </SectionCard>
        <SectionCard compact>
          <div className="mini-stat">
            <span className="mini-stat-label">On leave / resigned</span>
            <strong>{employeeCount - activeCount}</strong>
            <p>Out-of-office or inactive records</p>
          </div>
        </SectionCard>
      </section>

      <div className="split-layout">
        <SectionCard
          title="Employee directory"
          description="Manage the full roster and use the actions on each row to edit or remove a record."
        >
          {employees.length > 0 ? (
            <DataTable ariaLabel="Employee directory table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Dept / Position</th>
                  <th>Contact</th>
                  <th>Hired</th>
                  <th>Status</th>
                  <th className="table-actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.employee_id}>
                    <td>
                      <div className="table-person">
                        <strong>{employee.full_name}</strong>
                        <span>{employee.email}</span>
                      </div>
                    </td>
                    <td>
                      <div className="table-person">
                        <strong>{employee.department}</strong>
                        <span>{employee.position}</span>
                      </div>
                    </td>
                    <td>{employee.contact_number ?? '—'}</td>
                    <td>{formatDate(employee.date_hired)}</td>
                    <td>
                      <Badge tone={statusTone(employee.employment_status)}>
                        {employee.employment_status}
                      </Badge>
                    </td>
                    <td>
                      <div className="table-actions">
                        <ActionButton icon={faPenToSquare} onClick={() => beginEdit(employee)}>
                          Edit
                        </ActionButton>
                        <ActionButton
                          className="action-button--danger"
                          icon={faTrashCan}
                          onClick={() => void handleDelete(employee)}
                        >
                          Delete
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          ) : (
            <EmptyState
              action={<ActionButton icon={faPlus} onClick={beginCreate}>Add employee</ActionButton>}
              description="No employees have been added yet."
              icon={faUsers}
              title="No employee records"
            />
          )}
        </SectionCard>

        <SectionCard
          title={selectedEmployee ? 'Edit employee' : 'Add employee'}
          description="Use this panel to create new employee records or update an existing one."
          actions={
            selectedEmployee ? (
              <Badge tone="info">Editing #{selectedEmployee.employee_id}</Badge>
            ) : (
              <Badge tone="neutral">Create mode</Badge>
            )
          }
        >
          <form className="form-grid" onSubmit={onSubmit}>
            <label className="field">
              <span className="field-label">Full name</span>
              <div className="input-shell">
                <span className="input-icon" aria-hidden="true">
                  <FontAwesomeIcon icon={faUserCheck} />
                </span>
                <input
                  placeholder="Ava Santos"
                  {...register('full_name', { required: 'Full name is required.' })}
                />
              </div>
              {errors.full_name ? <span className="field-error">{errors.full_name.message}</span> : null}
            </label>

            <label className="field">
              <span className="field-label">Email</span>
              <div className="input-shell">
                <span className="input-icon" aria-hidden="true">
                  <FontAwesomeIcon icon={faEnvelope} />
                </span>
                <input
                  placeholder="ava.santos@hermes.test"
                  type="email"
                  {...register('email', { required: 'Email is required.' })}
                />
              </div>
              {errors.email ? <span className="field-error">{errors.email.message}</span> : null}
            </label>

            <label className="field">
              <span className="field-label">Department</span>
              <div className="input-shell">
                <span className="input-icon" aria-hidden="true">
                  <FontAwesomeIcon icon={faBuilding} />
                </span>
                <input
                  placeholder="Engineering"
                  {...register('department', { required: 'Department is required.' })}
                />
              </div>
              {errors.department ? <span className="field-error">{errors.department.message}</span> : null}
            </label>

            <label className="field">
              <span className="field-label">Position</span>
              <div className="input-shell">
                <span className="input-icon" aria-hidden="true">
                  <FontAwesomeIcon icon={faUserTie} />
                </span>
                <input
                  placeholder="Senior Developer"
                  {...register('position', { required: 'Position is required.' })}
                />
              </div>
              {errors.position ? <span className="field-error">{errors.position.message}</span> : null}
            </label>

            <label className="field">
              <span className="field-label">Contact number</span>
              <div className="input-shell">
                <span className="input-icon" aria-hidden="true">
                  <FontAwesomeIcon icon={faPhone} />
                </span>
                <input placeholder="+63 917 000 0001" {...register('contact_number')} />
              </div>
            </label>

            <label className="field">
              <span className="field-label">Date hired</span>
              <div className="input-shell">
                <span className="input-icon" aria-hidden="true">
                  <FontAwesomeIcon icon={faCalendarDays} />
                </span>
                <input
                  type="date"
                  {...register('date_hired', { required: 'Date hired is required.' })}
                />
              </div>
              {errors.date_hired ? <span className="field-error">{errors.date_hired.message}</span> : null}
            </label>

            <label className="field">
              <span className="field-label">Employment status</span>
              <select className="select-field" {...register('employment_status', { required: true })}>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <div className="form-actions">
              <button className="submit-button" type="submit" disabled={isSaving}>
                <span>{isSaving ? 'Saving' : selectedEmployee ? 'Update employee' : 'Create employee'}</span>
                <FontAwesomeIcon icon={faPlus} />
              </button>
              <button className="secondary-button" type="button" onClick={beginCreate}>
                Reset form
              </button>
            </div>
          </form>

          {notice ? <p className="inline-status inline-status--success">{notice}</p> : null}
          {error && employees.length > 0 ? <p className="inline-status inline-status--error">{error}</p> : null}
        </SectionCard>
      </div>
    </div>
  )
}
