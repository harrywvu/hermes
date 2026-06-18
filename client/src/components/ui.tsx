import type { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

type PageHeaderProps = {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
}

type SectionCardProps = {
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  compact?: boolean
}

type MetricCardProps = {
  icon: IconDefinition
  label: string
  value: string
  hint: string
  accentClassName?: string
}

type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

type BadgeProps = {
  children: ReactNode
  tone?: BadgeTone
}

type EmptyStateProps = {
  icon: IconDefinition
  title: string
  description: string
  action?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="page-title">{title}</h2>
        <p className="page-description">{description}</p>
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </header>
  )
}

export function SectionCard({ title, description, actions, children, compact }: SectionCardProps) {
  return (
    <section className={`surface-card${compact ? ' surface-card--compact' : ''}`}>
      {title || description || actions ? (
        <div className="section-card-header">
          <div>
            {title ? <h3 className="section-card-title">{title}</h3> : null}
            {description ? <p className="section-card-description">{description}</p> : null}
          </div>
          {actions ? <div className="section-card-actions">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export function MetricCard({ icon, label, value, hint, accentClassName }: MetricCardProps) {
  return (
    <article className={`metric-card${accentClassName ? ` ${accentClassName}` : ''}`}>
      <div className="metric-card-top">
        <span className="metric-icon">
          <FontAwesomeIcon icon={icon} />
        </span>
        <span className="metric-label">{label}</span>
      </div>
      <strong className="metric-value">{value}</strong>
      <p className="metric-hint">{hint}</p>
    </article>
  )
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}

export function ActionButton({
  icon,
  children,
  type = 'button',
  className = '',
  onClick,
  disabled,
}: {
  icon: IconDefinition
  children: ReactNode
  type?: 'button' | 'submit' | 'reset'
  className?: string
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button className={`action-button ${className}`.trim()} type={type} onClick={onClick} disabled={disabled}>
      <FontAwesomeIcon icon={icon} />
      <span>{children}</span>
    </button>
  )
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <FontAwesomeIcon icon={icon} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action ? <div className="empty-state-action">{action}</div> : null}
    </div>
  )
}

export function DataTable({ children, ariaLabel }: { children: ReactNode; ariaLabel: string }) {
  return (
    <div className="table-shell" role="region" aria-label={ariaLabel} tabIndex={0}>
      <table className="data-table">{children}</table>
    </div>
  )
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="form-grid">{children}</div>
}
