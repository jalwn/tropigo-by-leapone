import { useState, useEffect } from 'react'
import type { ApiResponse } from '@tropigo/types'
import type { Experience } from '../../api/src/db/schema'
import { formatPrice } from '@tropigo/utils'
import './App.css'

function App() {
  const [experiences, setExperiences] = useState<Experience[]>([])

  useEffect(() => {
    // Example: Fetch experiences from API
    fetch('http://localhost:8060/api/experiences')
      .then(res => res.json())
      .then((data: ApiResponse<Experience[]>) => {
        if (data.success && data.data) {
          setExperiences(data.data)
        }
      })
  }, [])

  return (
    <>
      <h1>TropiGo</h1>
      <p>Discover Local Experiences in the Maldives</p>

      <div className="experiences">
        {experiences.map(exp => (
          <div key={exp.id} className="card">
            <h3>{exp.title}</h3>
            <p>{exp.description}</p>
            <p><strong>{formatPrice(Number(exp.price))}</strong></p>
            <p>📍 {exp.island}</p>
            <p>🏷️ {exp.category}</p>
          </div>
        ))}
      </div>
    </>
  )
}

export default App
