import { apiFetch } from '../../api/client'
import { mapExchange, mapGenre, mapMessage, mapUser, mapVinyle } from '../../api/mappers'
import { currentUser, exchanges, exchangeMessages, genres, users, vinyles } from './state'

let initPromise: Promise<void> | null = null

async function fetchGenres() {
  const apiGenres = await apiFetch<any[]>('/api/genres')
  genres.value = apiGenres.map(mapGenre)
}

async function fetchUsers() {
  const apiUsers = await apiFetch<any[]>('/api/utilisateurs')
  users.value = apiUsers.map(mapUser)
}

async function fetchVinyles() {
  const apiVinyles = await apiFetch<any[]>('/api/vinyles')
  vinyles.value = apiVinyles.map(mapVinyle)
}

export async function refreshMessagesForExchange(exchangeId: string) {
  const apiMessages = await apiFetch<any[]>(
    `/api/messages?transaction_id=${encodeURIComponent(exchangeId)}`
  )
  exchangeMessages.value[exchangeId] = apiMessages.map(mapMessage)
}

async function fetchExchanges() {
  const apiExchanges = await apiFetch<any[]>('/api/echanges')
  exchanges.value = apiExchanges.map(mapExchange)
}

export async function ensureInitialized(): Promise<void> {
  if (initPromise) return initPromise

  initPromise = (async () => {
    await fetchGenres()
    await fetchUsers()
    await fetchVinyles()
    await fetchExchanges()

    if (!currentUser.value.id && users.value.length > 0) {
      currentUser.value = users.value[0]!
    }

    const discussions = exchanges.value.filter((e) => e.status === 'en discussion')
    await Promise.all(discussions.map((e) => refreshMessagesForExchange(e.id)))
  })()

  return initPromise
}

export async function setCurrentUserByPseudo(pseudo: string) {
  await ensureInitialized()
  const normalized = pseudo.trim().toLowerCase()
  const user = users.value.find((u) => u.nickname.toLowerCase() === normalized)
  if (!user) return null
  currentUser.value = user
  return user
}

// Utilitaire pour les tests (réinitialise cache + état).
export function __resetAppDataForTests() {
  initPromise = null
  genres.value = []
  users.value = []
  vinyles.value = []
  exchanges.value = []
  exchangeMessages.value = {}
  currentUser.value = { id: '', nickname: '', email: '', password: '' }
}
