const DEFAULT_BASE = 'http://localhost:3000'

export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL
  return (typeof fromEnv === 'string' && fromEnv.trim() !== '' ? fromEnv : DEFAULT_BASE).replace(/\/$/, '')
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const base = getApiBaseUrl()
  const url = path.startsWith('http') ? path : `${base}${path}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Erreur HTTP ${res.status}: ${text || res.statusText}`)
  }

  if (res.status === 204) return undefined as unknown as T

  return (await res.json()) as T
}
