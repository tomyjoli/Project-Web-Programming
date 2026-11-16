const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000').replace(/\/+$/, '')

export async function apiGet(path) {
  const response = await fetch(`${API_BASE_URL}${path}`)
  let result

  try {
    result = await response.json()
  } catch {
    if (!response.ok) {
      throw new Error(`The API request failed (${response.status}).`)
    }
    throw new Error('The API returned an invalid response.')
  }

  if (!response.ok) {
    throw new Error(result?.error || `The API request failed (${response.status}).`)
  }

  return result
}
