// WITHOUT PREFETCH - Normal useQuery pattern
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { experiencesQueryOptions } from '../../../api/experiences'

export const Route = createFileRoute('/basic/experiences/new')({
  // No loader = no prefetch
  component: NewExperiencePage,
})

function NewExperiencePage() {
  // Regular useQuery - fetches when component mounts
  // Shows loading spinner while fetching
  const { data, isLoading, error } = useQuery(experiencesQueryOptions)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  const experiences = data?.data || []

  return (
    <div>
      <h1>Add New Experience</h1>
      <p>WITHOUT PREFETCH - Shows loading spinner (normal useQuery)</p>

      <form>
        <h2>Form would go here...</h2>
      </form>

      <h3>Existing Experiences ({experiences.length})</h3>
      <ul>
        {experiences.map((exp) => (
          <li key={exp.id}>{exp.title}</li>
        ))}
      </ul>
    </div>
  )
}
