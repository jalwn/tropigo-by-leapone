// WITH PREFETCH - Data loads before component renders
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { experiencesQueryOptions } from '../../api/experiences'
import { formatPrice } from '@tropigo/utils'

export const Route = createFileRoute('/experiences/')({
  // Prefetch data in loader - runs BEFORE component renders
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(experiencesQueryOptions),
  component: ExperiencesPage,
})

function ExperiencesPage() {
  // Data is already loaded by the loader above
  // No loading spinner needed!
  const { data } = useQuery(experiencesQueryOptions)

  const experiences = data?.data || []

  return (
    <div>
      <h1>All Experiences</h1>
      <p>WITH PREFETCH - Data loaded instantly, no spinner!</p>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {experiences.map((exp) => (
          <div key={exp.id} style={{ border: '1px solid #ccc', padding: '1rem' }}>
            <h3>{exp.title}</h3>
            <p>{exp.description}</p>
            <p>
              <strong>{formatPrice(Number(exp.price))}</strong>
            </p>
            <p>📍 {exp.island}</p>
            <p>🏷️ {exp.category}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
