// API functions for experiences
import type { Experience } from '../../../api/src/db/schema'
import type { ApiResponse } from '@tropigo/types'

// Use relative URL for API calls - nginx will proxy to backend
const API_URL = import.meta.env.VITE_API_URL || '/api'

// Fetch all experiences
export async function fetchExperiences(): Promise<ApiResponse<Experience[]>> {
  const res = await fetch(`${API_URL}/experiences`)
  if (!res.ok) throw new Error('Failed to fetch experiences')
  return res.json()
}

// Query options for TanStack Query
export const experiencesQueryOptions = {
  queryKey: ['experiences'],
  queryFn: fetchExperiences,
}
