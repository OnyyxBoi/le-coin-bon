import type { Exchange, Genre, Message, User, Vinyl, VinylDisplay } from '../../types'
import { vinylesToDisplay } from '../../utils/typeHelpers'
import { exchanges, exchangeMessages, genres, users, vinyles } from './state'


export function getGenreById(id: string): Genre | undefined {
  return genres.value.find((g) => g.id === id)
}

export function getUserById(id: string): User | undefined {
  return users.value.find((u) => u.id === id)
}

export function getVinylById(id: string): Vinyl | undefined {
  return vinyles.value.find((v) => v.id === id)
}

export function getVinylDisplayById(id: string): VinylDisplay | undefined {
  const vinyl = vinyles.value.find((v) => v.id === id)
  return vinyl ? vinylesToDisplay([vinyl])[0] : undefined
}

export function getExchangeById(id: string): Exchange | undefined {
  return exchanges.value.find((e) => e.id === id)
}

export function getVinylWithDetails(vinyl: Vinyl): Vinyl & { owner?: User; genre?: Genre } {
  return {
    ...vinyl,
    owner: users.value.find((u) => u.id === vinyl.ownerId),
    genre: genres.value.find((g) => g.id === vinyl.genreId)
  }
}

export function getExchangeWithDetails(exchange: Exchange) {
  return {
    ...exchange,
    initiator: users.value.find((u) => u.id === exchange.initiatorId),
    recipient: users.value.find((u) => u.id === exchange.recipientId),
    initiatorVinyls: exchange.initiatorVinylIds
      .map((id) => vinyles.value.find((v) => v.id === id)!)
      .filter(Boolean),
    destinationVinyls: exchange.destinationVinylIds
      .map((id) => vinyles.value.find((v) => v.id === id)!)
      .filter(Boolean),
    messages: (exchangeMessages.value[exchange.id] || []) as Message[]
  }
}
