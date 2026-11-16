const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000').replace(/\/+$/, '')

export async function apiRequest(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
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

export function apiGet(path) {
  return apiRequest(path)
}
