import { ref, computed } from 'vue'
import type { User, Vinyl, Exchange, Message, Genre, VinylFormData, ExchangeFormData, MessageFormData, ExchangeStatus, VinylDisplay } from '../types'
import { vinylesToDisplay } from '../utils/typeHelpers'

// Données chargées via l'API
const genres = ref<Genre[]>([])

const currentUser = ref<User>({ id: '', nickname: '', email: '', password: '' })

const users = ref<User[]>([])


// Données vinyles chargées via l'API
const vinyles = ref<Vinyl[]>([])

const exchanges = ref<Exchange[]>([])

// Messages associés aux échanges (clé = exchangeId)
const exchangeMessages = ref<Record<string, Message[]>>({})

const API_BASE_URL = 'http://localhost:3000'

let initPromise: Promise<void> | null = null

const allowedConditions: Vinyl['condition'][] = ['Neuf', 'Très bon', 'Bon', 'Moyen', 'Usé']
const allowedStatuses: ExchangeStatus[] = ['en attente', 'en discussion', 'accepté', 'refusé']

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Erreur HTTP ${res.status}: ${text || res.statusText}`)
  }

  // DELETE renvoie 204 sans body
  if (res.status === 204) return undefined as unknown as T

  return (await res.json()) as T
}

function normalizeCondition(value: string): Vinyl['condition'] {
  return (allowedConditions.includes(value as Vinyl['condition']) ? value : 'Bon') as Vinyl['condition']
}

function normalizeExchangeStatus(value: string): ExchangeStatus {
  return (allowedStatuses.includes(value as ExchangeStatus) ? value : 'en attente') as ExchangeStatus
}

function mapGenre(apiGenre: any): Genre {
  return { id: String(apiGenre.id), name: apiGenre.nom }
}

function mapUser(apiUser: any): User {
  return { id: String(apiUser.id), nickname: apiUser.pseudo, email: apiUser.email, password: '' }
}

function mapVinyle(apiVinyle: any): Vinyl {
  return {
    id: String(apiVinyle.id),
    name: apiVinyle.nom,
    artist: apiVinyle.groupe_artist,
    genreId: apiVinyle.genre_id !== null && apiVinyle.genre_id !== undefined ? String(apiVinyle.genre_id) : '',
    condition: normalizeCondition(apiVinyle.etat),
    description: apiVinyle.description || '',
    image: apiVinyle.image || '',
    ownerId: String(apiVinyle.utilisateur_id)
  }
}

function mapExchange(apiExchange: any): Exchange {
  const date = apiExchange.date ? new Date(apiExchange.date).toISOString() : new Date().toISOString()

  return {
    id: String(apiExchange.id),
    initiatorId: String(apiExchange.initiateur_id),
    recipientId: String(apiExchange.destinataire_id),
    initiatorVinylIds: Array.isArray(apiExchange.vinyles_initiateur)
      ? apiExchange.vinyles_initiateur.map((id: any) => String(id))
      : [],
    destinationVinylIds: Array.isArray(apiExchange.vinyles_destinataire)
      ? apiExchange.vinyles_destinataire.map((id: any) => String(id))
      : [],
    status: normalizeExchangeStatus(apiExchange.statut),
    date
  }
}

function mapMessage(apiMessage: any): Message {
  return {
    id: String(apiMessage.id),
    userId: String(apiMessage.utilisateur_id),
    content: apiMessage.contenu,
    date: apiMessage.date ? new Date(apiMessage.date).toISOString() : new Date().toISOString()
  }
}

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

async function refreshMessagesForExchange(exchangeId: string) {
  const apiMessages = await apiFetch<any[]>(`/api/messages?transaction_id=${encodeURIComponent(exchangeId)}`)
  exchangeMessages.value[exchangeId] = apiMessages.map(mapMessage)
}

async function fetchExchanges() {
  const apiExchanges = await apiFetch<any[]>('/api/echanges')
  exchanges.value = apiExchanges.map(mapExchange)
}

async function ensureInitialized() {
  if (initPromise) return initPromise

  initPromise = (async () => {
    await fetchGenres()
    await fetchUsers()
    await fetchVinyles()
    await fetchExchanges()

    // Par défaut, on choisit le premier utilisateur connu (sinon l'app reste vide)
    if (!currentUser.value.id && users.value.length > 0) {
      currentUser.value = users.value[0]!
    }

    // Charger les messages des échanges "en discussion"
    const discussions = exchanges.value.filter(e => e.status === 'en discussion')
    await Promise.all(discussions.map(e => refreshMessagesForExchange(e.id)))
  })()

  return initPromise
}

async function setCurrentUserByPseudo(pseudo: string): Promise<User | null> {
  await ensureInitialized()
  const normalized = pseudo.trim().toLowerCase()
  const user = users.value.find(u => u.nickname.toLowerCase() === normalized)
  if (!user) return null
  currentUser.value = user
  return user
}

// Fonctions utilitaires pour enrichir les données
function getVinylWithDetails(vinyl: Vinyl): Vinyl & { owner?: User; genre?: Genre } {
  return {
    ...vinyl,
    owner: users.value.find(u => u.id === vinyl.ownerId),
    genre: genres.value.find(g => g.id === vinyl.genreId)
  }
}

function getExchangeWithDetails(exchange: Exchange) {
  return {
    ...exchange,
    initiator: users.value.find(u => u.id === exchange.initiatorId),
    recipient: users.value.find(u => u.id === exchange.recipientId),
    initiatorVinyls: exchange.initiatorVinylIds.map(id => vinyles.value.find(v => v.id === id)!).filter(Boolean),
    destinationVinyls: exchange.destinationVinylIds.map(id => vinyles.value.find(v => v.id === id)!).filter(Boolean),
    messages: exchangeMessages.value[exchange.id] || []
  }
}

export function useMockData() {
  void ensureInitialized().catch(() => {})

  const myVinyles = computed(() => 
    vinylesToDisplay(vinyles.value.filter(v => v.ownerId === currentUser.value.id))
  )

  const otherVinyles = computed(() => 
    vinylesToDisplay(vinyles.value.filter(v => v.ownerId !== currentUser.value.id))
  )

  const receivedExchanges = computed(() =>
    exchanges.value.filter(e => e.recipientId === currentUser.value.id)
  )

  const sentExchanges = computed(() =>
    exchanges.value.filter(e => e.initiatorId === currentUser.value.id)
  )

  async function addVinyl(vinylData: VinylFormData): Promise<Vinyl> {
    await ensureInitialized()
    if (!currentUser.value.id) {
      throw new Error('Connecte-toi (sélection d\'un utilisateur) avant d\'ajouter un vinyle.')
    }

    const created = await apiFetch<any>('/api/vinyles', {
      method: 'POST',
      body: JSON.stringify({
        nom: vinylData.name,
        groupe_artist: vinylData.artist,
        genre_id: vinylData.genreId ? Number(vinylData.genreId) : null,
        etat: vinylData.condition,
        description: vinylData.description || null,
        image: vinylData.image || null,
        utilisateur_id: Number(currentUser.value.id)
      })
    })

    const mapped = mapVinyle(created)
    vinyles.value.push(mapped)
    return mapped
  }

  async function updateVinyl(id: string, updates: VinylFormData): Promise<void> {
    await ensureInitialized()
    if (!currentUser.value.id) {
      throw new Error('Connecte-toi (sélection d\'un utilisateur) avant de modifier un vinyle.')
    }

    const index = vinyles.value.findIndex(v => v.id === id)
    if (index === -1) return

    const updated = await apiFetch<any>(`/api/vinyles/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({
        nom: updates.name,
        groupe_artist: updates.artist,
        genre_id: updates.genreId ? Number(updates.genreId) : null,
        etat: updates.condition,
        description: updates.description || null,
        image: updates.image || null,
        utilisateur_id: Number(currentUser.value.id)
      })
    })

    vinyles.value[index] = mapVinyle(updated)
  }

  async function deleteVinyl(id: string): Promise<void> {
    await ensureInitialized()
    await apiFetch<void>(`/api/vinyles/${encodeURIComponent(id)}`, { method: 'DELETE' })
    vinyles.value = vinyles.value.filter(v => v.id !== id)
  }

  function searchVinyles(query: string, genreId?: string): VinylDisplay[] {
    if (!query.trim() && !genreId) return []
    const lowerQuery = query.toLowerCase()
    const filtered = vinyles.value.filter(v => {
      if (v.ownerId === currentUser.value.id) return false
      
      const owner = users.value.find(u => u.id === v.ownerId)
      const matchesQuery = !query.trim() || 
        v.name.toLowerCase().includes(lowerQuery) ||
        v.artist.toLowerCase().includes(lowerQuery) ||
        (owner && owner.nickname.toLowerCase().includes(lowerQuery))
      const matchesGenre = !genreId || v.genreId === genreId
      return matchesQuery && matchesGenre
    })
    return vinylesToDisplay(filtered)
  }

  function getVinylesByGenre(genreId: string): VinylDisplay[] {
    return vinylesToDisplay(vinyles.value.filter(v => v.genreId === genreId))
  }

  function getSuggestedVinyles(vinylId?: string, limit: number = 8): VinylDisplay[] {
    if (!vinylId) {
      return otherVinyles.value.slice(0, limit)
    }
    
    const vinyl = vinyles.value.find(v => v.id === vinylId)
    if (!vinyl) {
      return otherVinyles.value.slice(0, limit)
    }

    const otherVinylesRaw = vinyles.value.filter(v => v.ownerId !== currentUser.value.id)
    const sameGenre = otherVinylesRaw
      .filter(v => v.id !== vinylId && v.genreId === vinyl.genreId)
      .slice(0, Math.floor(limit * 0.7))
    
    const otherGenres = otherVinylesRaw
      .filter(v => v.id !== vinylId && v.genreId !== vinyl.genreId)
      .slice(0, limit - sameGenre.length)
    
    return vinylesToDisplay([...sameGenre, ...otherGenres])
  }

  async function createExchange(exchangeData: ExchangeFormData): Promise<Exchange | null> {
    await ensureInitialized()
    if (!currentUser.value.id) return null

    const initiateurId = Number(currentUser.value.id)
    const destinataireId = Number(exchangeData.recipientId)

    const vinylesInitiateur = exchangeData.initiatorVinylIds.map(id => Number(id))
    const vinylesDestinataire = exchangeData.destinationVinylIds.map(id => Number(id))

    if (
      Number.isNaN(initiateurId) ||
      Number.isNaN(destinataireId) ||
      vinylesInitiateur.some(id => Number.isNaN(id)) ||
      vinylesDestinataire.some(id => Number.isNaN(id))
    ) {
      throw new Error('IDs invalides pour créer un échange.')
    }

    const created = await apiFetch<any>('/api/echanges', {
      method: 'POST',
      body: JSON.stringify({
        initiateur_id: initiateurId,
        destinataire_id: destinataireId,
        vinyles_initiateur: vinylesInitiateur,
        vinyles_destinataire: vinylesDestinataire
      })
    })

    const mapped = mapExchange(created)
    exchanges.value.push(mapped)
    return mapped
  }

  async function updateExchangeStatus(exchangeId: string, status: ExchangeStatus): Promise<void> {
    await ensureInitialized()

    const updatedApi = await apiFetch<any>(`/api/echanges/${encodeURIComponent(exchangeId)}`, {
      method: 'PUT',
      body: JSON.stringify({ statut: status })
    })

    const mapped = mapExchange(updatedApi)
    const index = exchanges.value.findIndex(e => e.id === exchangeId)
    if (index !== -1) {
      exchanges.value[index] = mapped
    } else {
      exchanges.value.push(mapped)
    }

    if (status === 'en discussion') {
      await refreshMessagesForExchange(exchangeId)
    } else {
      exchangeMessages.value[exchangeId] = []
    }
  }

  async function addMessageToExchange(exchangeId: string, messageData: MessageFormData): Promise<Message> {
    await ensureInitialized()
    if (!currentUser.value.id) {
      throw new Error('Connecte-toi (sélection d\'un utilisateur) avant d\'envoyer un message.')
    }

    const created = await apiFetch<any>('/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        transaction_id: Number(exchangeId),
        utilisateur_id: Number(currentUser.value.id),
        contenu: messageData.content
      })
    })

    const mapped = mapMessage(created)
    if (!exchangeMessages.value[exchangeId]) {
      exchangeMessages.value[exchangeId] = []
    }
    exchangeMessages.value[exchangeId].push(mapped)
    return mapped
  }

  function getVinylById(id: string): Vinyl | undefined {
    return vinyles.value.find(v => v.id === id)
  }

  function getVinylDisplayById(id: string): VinylDisplay | undefined {
    const vinyl = vinyles.value.find(v => v.id === id)
    return vinyl ? vinylesToDisplay([vinyl])[0] : undefined
  }

  function getGenreById(id: string): Genre | undefined {
    return genres.value.find(g => g.id === id)
  }

  function getUserById(id: string): User | undefined {
    return users.value.find(u => u.id === id)
  }

  function getExchangeById(id: string): Exchange | undefined {
    return exchanges.value.find(e => e.id === id)
  }

  return {
    // Données
    currentUser,
    users,
    vinyles,
    exchanges,
    exchangeMessages,
    genres,
    
    // Computed
    myVinyles,
    otherVinyles,
    receivedExchanges,
    sentExchanges,
    
    // Fonctions utilitaires
    getVinylWithDetails,
    getExchangeWithDetails,
    
    // CRUD Vinyles
    addVinyl,
    updateVinyl,
    deleteVinyl,
    getVinylById,
    getVinylDisplayById,
    
    // Recherche
    searchVinyles,
    getVinylesByGenre,
    getSuggestedVinyles,
    
    // Genres
    getGenreById,
    
    // Users
    getUserById,
    
    // Exchanges
    createExchange,
    updateExchangeStatus,
    getExchangeById,
    
    // Messages
    addMessageToExchange,

    // Connexion (sans auth: on choisit un utilisateur via pseudo)
    setCurrentUserByPseudo
  }
}
