import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/vue'
import * as matchers from '@testing-library/jest-dom/matchers'

// Étendre Vitest avec les matchers de testing-library
expect.extend(matchers)

// Mock API par défaut (évite dépendance au backend dans les tests Vitest)
// Les tests qui ont besoin de cas particuliers peuvent override globalThis.fetch dans leurs beforeEach.
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : String(input)
  const path = url.replace(/^https?:\/\/[^/]+/, '')
  const method = (init?.method || 'GET').toUpperCase()

  const json = (obj: any, status = 200) =>
    new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } })

  // Jeu de données minimal pour HomePage/SearchPage
  if (path === '/api/genres' && method === 'GET') return json([{ id: 1, nom: 'Rock' }])
  if (path === '/api/utilisateurs' && method === 'GET')
    return json([
      { id: 1, pseudo: 'alice', email: 'alice@demo.local' },
      { id: 2, pseudo: 'bob', email: 'bob@demo.local' }
    ])
  if (path === '/api/vinyles' && method === 'GET')
    return json([
      {
        id: 1,
        nom: 'Another Light',
        groupe_artist: 'Red Vox',
        genre_id: 1,
        etat: 'Bon',
        description: 'desc',
        image: null,
        utilisateur_id: 2
      }
    ])
  if (path === '/api/echanges' && method === 'GET') return json([])
  if (path.startsWith('/api/messages') && method === 'GET') return json([])

  return json({ error: 'Not mocked (setup.ts)' }, 500)
}) as any

// Nettoyer après chaque test
afterEach(() => {
  cleanup()
})
