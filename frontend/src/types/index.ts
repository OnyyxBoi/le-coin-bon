export interface User {
  id: string
  nickname: string
  email: string
  password: string
}

export interface Genre {
  id: string
  name: string
}

export interface Vinyl {
  id: string
  name: string
  artist: string
  genreId: string
  condition: 'Neuf' | 'Très bon' | 'Bon' | 'Moyen' | 'Usé'
  description: string
  image: string
  ownerId: string
}

export type ExchangeStatus = 'en attente' | 'en discussion' | 'accepté' | 'refusé'

export interface Exchange {
  id: string
  initiatorId: string
  recipientId: string
  initiatorVinylIds: string[]
  destinationVinylIds: string[]
  status: ExchangeStatus
  date: string
}

export interface Message {
  id: string
  userId: string
  content: string
  date: string
}

export interface VinylWithDetails extends Vinyl {
  owner?: User
  genre?: Genre
}

export interface VinylDisplay {
  id: string
  title: string
  name: string
  artist: string
  genre: string
  genreId: string
  condition: Vinyl['condition']
  description: string
  image: string
  ownerId: string
  ownerName: string
}

export interface ExchangeWithDetails extends Exchange {
  initiator?: User
  recipient?: User
  initiatorVinyls?: Vinyl[]
  destinationVinyls?: Vinyl[]
  messages?: Message[]
}

export interface VinylFormData {
  name: string
  artist: string
  genreId: string
  condition: Vinyl['condition']
  description: string
  image: string
}

export interface UserFormData {
  nickname: string
  email: string
  password: string
}

export interface ExchangeFormData {
  recipientId: string
  initiatorVinylIds: string[]
  destinationVinylIds: string[]
}

export interface MessageFormData {
  content: string
}
