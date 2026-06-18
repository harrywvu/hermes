type SectionPageProps = {
  title: string
  description: string
}

export default function SectionPage({ title, description }: SectionPageProps) {
  return (
    <section className="page-card">
      <p className="eyebrow">Route scaffold</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  )
}
