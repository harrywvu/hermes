import type { AxiosError } from 'axios'
import apiClient from '../api/client'

export type LoginResponse = {
  access_token: string
  token_type: string
  admin_id: number
  email: string
}

export type DashboardResponse = {
  total_employees: number
  active_employees: number
  employees_on_leave: number
  total_monthly_payroll: string | number
}

export type EmploymentStatus = 'Active' | 'Resigned' | 'On Leave'

export type Employee = {
  employee_id: number
  full_name: string
  email: string
  contact_number: string | null
  department: string
  position: string
  date_hired: string
  employment_status: EmploymentStatus
}

export type EmployeeCreatePayload = {
  full_name: string
  email: string
  contact_number: string | null
  department: string
  position: string
  date_hired: string
  employment_status: EmploymentStatus
}

export type EmployeeUpdatePayload = Partial<EmployeeCreatePayload>

export type Salary = {
  id: number
  employee_id: number
  basic_salary: string | number
  allowance: string | number
  deductions: string | number
  net_salary: string | number
}

export type SalaryCreatePayload = {
  employee_id: number
  basic_salary: string
  allowance: string
  deductions: string
}

export type SalaryUpdatePayload = Partial<Omit<SalaryCreatePayload, 'employee_id'>>

export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'On Leave'

export type AttendanceRecord = {
  id: number
  employee_id: number
  employee_name: string
  date: string
  time_in: string | null
  time_out: string | null
  status: AttendanceStatus
}

export type AttendanceCreatePayload = {
  employee_id: number
  date: string
  time_in: string | null
  time_out: string | null
  status: AttendanceStatus
}

export type PayrollRecord = {
  id: number
  employee_id: number
  employee_name: string
  basic_salary: string | number
  allowance: string | number
  deductions: string | number
  net_salary: string | number
  payroll_date: string
}

export type ApiErrorPayload = {
  detail?: string
}

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<ApiErrorPayload>(error)) {
    return error.response?.data?.detail ?? fallback
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

function isAxiosError<T>(error: unknown): error is AxiosError<T> {
  return Boolean(error && typeof error === 'object' && 'isAxiosError' in error)
}

export { getErrorMessage }

export function formatMoney(value: string | number) {
  const numericValue = Number(value)
  if (Number.isNaN(numericValue)) {
    return '—'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(numericValue)
}

export function formatDate(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed)
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return '—'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(parsed)
}

export async function signIn(email: string, password: string) {
  const response = await apiClient.post<LoginResponse>('/login', { email, password })
  return response.data
}

export async function fetchDashboard() {
  const response = await apiClient.get<DashboardResponse>('/dashboard')
  return response.data
}

export async function fetchEmployees() {
  const response = await apiClient.get<Employee[]>('/employees')
  return response.data
}

export async function createEmployee(payload: EmployeeCreatePayload) {
  const response = await apiClient.post<Employee>('/employees', payload)
  return response.data
}

export async function updateEmployee(employeeId: number, payload: EmployeeUpdatePayload) {
  const response = await apiClient.put<Employee>(`/employees/${employeeId}`, payload)
  return response.data
}

export async function deleteEmployee(employeeId: number) {
  const response = await apiClient.delete<Employee>(`/employees/${employeeId}`)
  return response.data
}

export async function fetchSalary(employeeId: number) {
  const response = await apiClient.get<Salary>(`/salary/${employeeId}`)
  return response.data
}

export async function createSalary(payload: SalaryCreatePayload) {
  const response = await apiClient.post<Salary>('/salary', payload)
  return response.data
}

export async function updateSalary(employeeId: number, payload: SalaryUpdatePayload) {
  const response = await apiClient.put<Salary>(`/salary/${employeeId}`, payload)
  return response.data
}

export async function fetchAttendance() {
  const response = await apiClient.get<AttendanceRecord[]>('/attendance')
  return response.data
}

export async function createAttendance(payload: AttendanceCreatePayload) {
  const response = await apiClient.post<AttendanceRecord>('/attendance', payload)
  return response.data
}

export async function fetchPayroll() {
  const response = await apiClient.get<PayrollRecord[]>('/payroll')
  return response.data
}