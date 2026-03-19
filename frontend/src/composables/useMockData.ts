import { ref, computed } from 'vue'
import type { User, Vinyl, Exchange, Message, Genre, VinylFormData, ExchangeFormData, MessageFormData, ExchangeStatus, VinylDisplay } from '@/types'
import { vinylesToDisplay } from '@/utils/typeHelpers'

// Données mockées
const genres = ref<Genre[]>([
  { id: 'g1', name: 'Rock' },
  { id: 'g2', name: 'Jazz' },
  { id: 'g3', name: 'Pop' },
  { id: 'g4', name: 'Classical' },
  { id: 'g5', name: 'Electronic' },
  { id: 'g6', name: 'Hip-Hop' },
  { id: 'g7', name: 'Blues' },
  { id: 'g8', name: 'Country' },
  { id: 'g9', name: 'Folk' },
  { id: 'g10', name: 'Reggae' },
  { id: 'g11', name: 'Metal' },
  { id: 'g12', name: 'R&B' }
])

const currentUser = ref<User>({
  id: 'user1',
  nickname: 'VinylLover',
  email: 'vinyl@example.com',
  password: 'password123'
})

const users = ref<User[]>([
  { id: 'user1', nickname: 'VinylLover', email: 'vinyl@example.com', password: 'password123' },
  { id: 'user2', nickname: 'MusicCollector', email: 'collector@example.com', password: 'password123' },
  { id: 'user3', nickname: 'JazzFan', email: 'jazz@example.com', password: 'password123' },
  { id: 'user4', nickname: 'RockEnthusiast', email: 'rock@example.com', password: 'password123' }
])

const vinyles = ref<Vinyl[]>([
  {
    id: 'v1',
    name: 'Dark Side of the Moon',
    artist: 'Pink Floyd',
    genreId: 'g1',
    condition: 'Très bon',
    description: 'Album emblématique de Pink Floyd, pressage original. Quelques micro-rayures mais son excellent.',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    ownerId: 'user2'
  },
  {
    id: 'v2',
    name: 'Abbey Road',
    artist: 'The Beatles',
    genreId: 'g1',
    condition: 'Bon',
    description: 'Pressage français des années 70. Pochette en bon état, vinyle avec quelques craquements mineurs.',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    ownerId: 'user2'
  },
  {
    id: 'v3',
    name: 'Kind of Blue',
    artist: 'Miles Davis',
    genreId: 'g2',
    condition: 'Neuf',
    description: 'Réédition moderne, jamais joué. Encore sous blister.',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    ownerId: 'user3'
  },
  {
    id: 'v4',
    name: 'Led Zeppelin IV',
    artist: 'Led Zeppelin',
    genreId: 'g1',
    condition: 'Très bon',
    description: 'Pressage original américain. Pochette avec légère usure mais vinyle impeccable.',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    ownerId: 'user4'
  },
  {
    id: 'v5',
    name: 'The Wall',
    artist: 'Pink Floyd',
    genreId: 'g1',
    condition: 'Moyen',
    description: 'Double album, quelques rayures visibles mais jouable. Pochette avec déchirure mineure.',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    ownerId: 'user1'
  },
  {
    id: 'v6',
    name: 'Blue',
    artist: 'Joni Mitchell',
    genreId: 'g9',
    condition: 'Très bon',
    description: 'Pressage original canadien. Excellent état général.',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    ownerId: 'user3'
  },
  {
    id: 'v7',
    name: 'Rumours',
    artist: 'Fleetwood Mac',
    genreId: 'g1',
    condition: 'Bon',
    description: 'Classique des années 70, quelques signes d\'usure mais son correct.',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    ownerId: 'user4'
  },
  {
    id: 'v8',
    name: 'Thriller',
    artist: 'Michael Jackson',
    genreId: 'g3',
    condition: 'Neuf',
    description: 'Réédition 40ème anniversaire, encore scellé.',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    ownerId: 'user2'
  },
  {
    id: 'v9',
    name: 'A Love Supreme',
    artist: 'John Coltrane',
    genreId: 'g2',
    condition: 'Très bon',
    description: 'Pressage original, excellent état.',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    ownerId: 'user3'
  },
  {
    id: 'v10',
    name: 'Back in Black',
    artist: 'AC/DC',
    genreId: 'g1',
    condition: 'Bon',
    description: 'Classique du hard rock, quelques signes d\'usure.',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    ownerId: 'user4'
  },
  {
    id: 'v11',
    name: 'Random Access Memories',
    artist: 'Daft Punk',
    genreId: 'g5',
    condition: 'Neuf',
    description: 'Album moderne, encore sous blister.',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    ownerId: 'user2'
  },
  {
    id: 'v12',
    name: 'The Miseducation of Lauryn Hill',
    artist: 'Lauryn Hill',
    genreId: 'g6',
    condition: 'Très bon',
    description: 'Pressage original, excellent état.',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    ownerId: 'user2'
  }
])

const exchanges = ref<Exchange[]>([
  {
    id: 'e1',
    initiatorId: 'user2',
    recipientId: 'user1',
    initiatorVinylIds: ['v2'],
    destinationVinylIds: ['v5'],
    status: 'en attente',
    date: '2024-01-15T10:30:00Z'
  }
])

// Messages associés aux échanges (clé = exchangeId)
const exchangeMessages = ref<Record<string, Message[]>>({})

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

// Composable principal
export function useMockData() {
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

  function addVinyl(vinylData: VinylFormData): Vinyl {
    const newVinyl: Vinyl = {
      id: `v${Date.now()}`,
      ...vinylData,
      ownerId: currentUser.value.id
    }
    vinyles.value.push(newVinyl)
    return newVinyl
  }

  function updateVinyl(id: string, updates: Partial<VinylFormData>): void {
    const index = vinyles.value.findIndex(v => v.id === id)
    if (index !== -1) {
      vinyles.value[index] = { ...vinyles.value[index], ...updates }
    }
  }

  function deleteVinyl(id: string): void {
    const index = vinyles.value.findIndex(v => v.id === id)
    if (index !== -1) {
      vinyles.value.splice(index, 1)
    }
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

  function createExchange(exchangeData: ExchangeFormData): Exchange | null {
    const newExchange: Exchange = {
      id: `e${Date.now()}`,
      ...exchangeData,
      status: 'en attente',
      date: new Date().toISOString()
    }
    
    exchanges.value.push(newExchange)
    return newExchange
  }

  function updateExchangeStatus(exchangeId: string, status: ExchangeStatus): void {
    const exchange = exchanges.value.find(e => e.id === exchangeId)
    if (exchange) {
      exchange.status = status
      // Initialiser les messages si on passe en discussion
      if (status === 'en discussion' && !exchangeMessages.value[exchangeId]) {
        exchangeMessages.value[exchangeId] = []
      }
    }
  }

  function addMessageToExchange(exchangeId: string, messageData: MessageFormData): Message {
    const newMessage: Message = {
      id: `m${Date.now()}`,
      userId: currentUser.value.id,
      ...messageData,
      date: new Date().toISOString()
    }
    
    if (!exchangeMessages.value[exchangeId]) {
      exchangeMessages.value[exchangeId] = []
    }
    exchangeMessages.value[exchangeId].push(newMessage)
    return newMessage
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
    addMessageToExchange
  }
}
