// API functions for experiences
import type { Experience } from '../../../api/src/db/schema'
import type { ApiResponse } from '@tropigo/types'

const API_URL = 'http://localhost:8060'

// Fetch all experiences
export async function fetchExperiences(): Promise<ApiResponse<Experience[]>> {
  const res = await fetch(`${API_URL}/api/experiences`)
  if (!res.ok) throw new Error('Failed to fetch experiences')
  return res.json()
}

// Query options for TanStack Query
export const experiencesQueryOptions = {
  queryKey: ['experiences'],
  queryFn: fetchExperiences,
}
