import type { Vinyl, User, Genre } from '@/types'
import { genres, users } from '../composables/appData/state'

/**
 * Adaptateur pour convertir les vinyles avec leurs relations
 * en format compatible avec les composants existants
 */
export function getVinylDisplayData(vinyl: Vinyl) {
  const owner = users.value.find((u) => u.id === vinyl.ownerId)
  const genre = genres.value.find((g) => g.id === vinyl.genreId)

  return {
    id: vinyl.id,
    title: vinyl.name,
    artist: vinyl.artist,
    genre: genre?.name || '',
    genreId: vinyl.genreId,
    condition: vinyl.condition,
    description: vinyl.description,
    image: vinyl.image,
    ownerId: vinyl.ownerId,
    ownerName: owner?.nickname || ''
  }
}

export function getUserDisplayName(user: User | undefined): string {
  return user?.nickname || ''
}

export function getGenreName(genreId: string): string {
  return genres.value.find((g) => g.id === genreId)?.name || ''
}
