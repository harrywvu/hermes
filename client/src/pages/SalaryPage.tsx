import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowUpRightDots,
  faBan,
  faCheck,
  faExclamationTriangle,
  faMoneyBillWave,
  faPenToSquare,
  faSave,
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
  createSalary,
  fetchEmployees,
  fetchSalary,
  formatMoney,
  getErrorMessage,
  type Employee,
  type Salary,
  updateSalary,
} from '../lib/hrms'

type SalaryFormValues = {
  basic_salary: string
  allowance: string
  deductions: string
}

function emptyValues(): SalaryFormValues {
  return {
    basic_salary: '',
    allowance: '0',
    deductions: '0',
  }
}

export default function SalaryPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [salaries, setSalaries] = useState<Map<number, Salary>>(new Map())
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<SalaryFormValues>({
    mode: 'onTouched',
    defaultValues: emptyValues(),
  })

  const formValues = watch()
  const netSalary = useMemo(() => {
    const basic = parseFloat(formValues.basic_salary) || 0
    const allowance = parseFloat(formValues.allowance) || 0
    const deductions = parseFloat(formValues.deductions) || 0
    return basic + allowance - deductions
  }, [formValues])

  useEffect(() => {
    let cancelled = false

    async function loadEmployees() {
      setIsLoading(true)
      setError('')

      try {
        const response = await fetchEmployees()
        if (!cancelled) {
          setEmployees(response)
          // Fetch salaries for all employees
          const salaryMap = new Map<number, Salary>()
          for (const employee of response) {
            try {
              const salary = await fetchSalary(employee.employee_id)
              salaryMap.set(employee.employee_id, salary)
            } catch {
              // Salary might not exist yet, that's okay
            }
          }
          setSalaries(salaryMap)
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

  const selectedEmployee = employees.find((e) => e.employee_id === selectedEmployeeId)
  const selectedSalary = selectedEmployeeId ? salaries.get(selectedEmployeeId) : null

  function selectEmployee(employeeId: number) {
    setSelectedEmployeeId(employeeId)
    setNotice('')
    setError('')

    const salary = salaries.get(employeeId)
    if (salary) {
      reset({
        basic_salary: String(salary.basic_salary),
        allowance: String(salary.allowance),
        deductions: String(salary.deductions),
      })
    } else {
      reset(emptyValues())
    }
  }

  function clearSelection() {
    setSelectedEmployeeId(null)
    setNotice('')
    setError('')
    reset(emptyValues())
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!selectedEmployee) return

    setIsSaving(true)
    setNotice('')

    try {
      const basic = parseFloat(values.basic_salary)
      const allowance = parseFloat(values.allowance) || 0
      const deductions = parseFloat(values.deductions) || 0

      if (selectedSalary) {
        await updateSalary(selectedEmployee.employee_id, {
          basic_salary: basic,
          allowance,
          deductions,
        })
        setNotice('Salary updated successfully.')
      } else {
        await createSalary({
          employee_id: selectedEmployee.employee_id,
          basic_salary: basic,
          allowance,
          deductions,
        })
        setNotice('Salary created successfully.')
      }

      // Refresh salaries map
      const updatedSalary = await fetchSalary(selectedEmployee.employee_id)
      setSalaries((prev) => new Map(prev).set(selectedEmployee.employee_id, updatedSalary))
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to save salary right now.'))
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

  if (error && employees.length === 0) {
    return (
      <SectionCard>
        <EmptyState
          action={<ActionButton icon={faMoneyBillWave} onClick={() => window.location.reload()}>Retry</ActionButton>}
          description={error}
          icon={faExclamationTriangle}
          title="Salary management unavailable"
        />
      </SectionCard>
    )
  }

  const employeesWithoutSalary = employees.filter((e) => !salaries.has(e.employee_id))

  return (
    <div className="page-stack">

      <section className="metric-grid metric-grid--compact">
        <SectionCard compact>
          <div className="mini-stat">
            <span className="mini-stat-label">Employees</span>
            <strong>{employees.length}</strong>
            <p>Total employees in directory</p>
          </div>
        </SectionCard>
        <SectionCard compact>
          <div className="mini-stat">
            <span className="mini-stat-label">Salaries configured</span>
            <strong>{salaries.size}</strong>
            <p>Have salary records set up</p>
          </div>
        </SectionCard>
        <SectionCard compact>
          <div className="mini-stat">
            <span className="mini-stat-label">Pending configuration</span>
            <strong>{employeesWithoutSalary.length}</strong>
            <p>Need salary information entered</p>
          </div>
        </SectionCard>
      </section>

      <div className="split-layout">
        <SectionCard
          title="Employee directory"
          description="Select an employee to view or edit their salary configuration."
        >
          {employees.length > 0 ? (
            <DataTable ariaLabel="Employee salary directory">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Basic salary</th>
                  <th>Net salary</th>
                  <th className="table-actions-col">Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => {
                  const salary = salaries.get(employee.employee_id)
                  const isSelected = selectedEmployeeId === employee.employee_id

                  return (
                    <tr key={employee.employee_id} className={isSelected ? 'is-selected' : ''}>
                      <td>
                        <div className="table-person">
                          <strong>{employee.full_name}</strong>
                          <span>{employee.email}</span>
                        </div>
                      </td>
                      <td>{salary ? formatMoney(salary.basic_salary) : '—'}</td>
                      <td>{salary ? formatMoney(salary.net_salary) : '—'}</td>
                      <td>
                        <div className="table-actions">
                          <ActionButton
                            icon={isSelected ? faCheck : faPenToSquare}
                            onClick={() => selectEmployee(employee.employee_id)}
                          >
                            {isSelected ? 'Selected' : 'Edit'}
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </DataTable>
          ) : (
            <EmptyState
              description="No employees have been added yet."
              icon={faMoneyBillWave}
              title="No employees"
            />
          )}
        </SectionCard>

        <SectionCard
          title={selectedEmployee ? `Salary for ${selectedEmployee.full_name}` : 'Select an employee'}
          description={
            selectedEmployee ? `Configure compensation package for ${selectedEmployee.full_name}.` : 'Choose an employee from the directory to manage their salary.'
          }
          actions={
            selectedSalary ? (
              <Badge tone="info">Updating</Badge>
            ) : selectedEmployee ? (
              <Badge tone="warning">New record</Badge>
            ) : (
              <Badge tone="neutral">Idle</Badge>
            )
          }
        >
          {selectedEmployee ? (
            <form className="form-grid" onSubmit={onSubmit}>
              <label className="field">
                <span className="field-label">Basic salary</span>
                <div className="input-shell">
                  <span className="input-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faMoneyBillWave} />
                  </span>
                  <input
                    placeholder="45000"
                    type="number"
                    step="100"
                    min="0"
                    {...register('basic_salary', {
                      required: 'Basic salary is required.',
                      min: { value: 0, message: 'Basic salary must be positive.' },
                    })}
                  />
                </div>
                {errors.basic_salary ? (
                  <span className="field-error">{errors.basic_salary.message}</span>
                ) : null}
              </label>

              <label className="field">
                <span className="field-label">Allowance</span>
                <div className="input-shell">
                  <span className="input-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faArrowUpRightDots} />
                  </span>
                  <input
                    placeholder="0"
                    type="number"
                    step="100"
                    min="0"
                    {...register('allowance', {
                      min: { value: 0, message: 'Allowance cannot be negative.' },
                    })}
                  />
                </div>
                {errors.allowance ? (
                  <span className="field-error">{errors.allowance.message}</span>
                ) : null}
              </label>

              <label className="field">
                <span className="field-label">Deductions</span>
                <div className="input-shell">
                  <span className="input-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faBan} />
                  </span>
                  <input
                    placeholder="0"
                    type="number"
                    step="100"
                    min="0"
                    {...register('deductions', {
                      min: { value: 0, message: 'Deductions cannot be negative.' },
                    })}
                  />
                </div>
                {errors.deductions ? (
                  <span className="field-error">{errors.deductions.message}</span>
                ) : null}
              </label>

              <div className="salary-summary">
                <div className="summary-item">
                  <span className="summary-label">Basic salary</span>
                  <span className="summary-value">{formatMoney(parseFloat(formValues.basic_salary) || 0)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Allowance</span>
                  <span className="summary-value">+{formatMoney(parseFloat(formValues.allowance) || 0)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Deductions</span>
                  <span className="summary-value">−{formatMoney(parseFloat(formValues.deductions) || 0)}</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-item summary-item--total">
                  <span className="summary-label">Net salary</span>
                  <strong>{formatMoney(netSalary)}</strong>
                </div>
              </div>

              <div className="form-actions">
                <button className="submit-button" type="submit" disabled={isSaving}>
                  <span>{isSaving ? 'Saving' : selectedSalary ? 'Update salary' : 'Create salary'}</span>
                  <FontAwesomeIcon icon={faSave} />
                </button>
                <button className="secondary-button" type="button" onClick={clearSelection}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <EmptyState
              description="Choose an employee from the list to configure their salary components."
              icon={faMoneyBillWave}
              title="No selection"
            />
          )}

          {notice ? <p className="inline-status inline-status--success">{notice}</p> : null}
          {error && employees.length > 0 ? <p className="inline-status inline-status--error">{error}</p> : null}
        </SectionCard>
      </div>
    </div>
  )
}
