import type { User, Vinyl, Exchange, Message, Genre, ExchangeStatus } from '../types'

const allowedConditions: Vinyl['condition'][] = ['Neuf', 'Très bon', 'Bon', 'Moyen', 'Usé']
const allowedStatuses: ExchangeStatus[] = ['en attente', 'en discussion', 'accepté', 'refusé']

export function normalizeCondition(value: string): Vinyl['condition'] {
  return (allowedConditions.includes(value as Vinyl['condition']) ? value : 'Bon') as Vinyl['condition']
}

export function normalizeExchangeStatus(value: string): ExchangeStatus {
  return (allowedStatuses.includes(value as ExchangeStatus) ? value : 'en attente') as ExchangeStatus
}

export function mapGenre(apiGenre: any): Genre {
  return { id: String(apiGenre.id), name: apiGenre.nom }
}

export function mapUser(apiUser: any): User {
  return { id: String(apiUser.id), nickname: apiUser.pseudo, email: apiUser.email, password: '' }
}

export function mapVinyle(apiVinyle: any): Vinyl {
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

export function mapExchange(apiExchange: any): Exchange {
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

export function mapMessage(apiMessage: any): Message {
  return {
    id: String(apiMessage.id),
    userId: String(apiMessage.utilisateur_id),
    content: apiMessage.contenu,
    date: apiMessage.date ? new Date(apiMessage.date).toISOString() : new Date().toISOString()
  }
}
