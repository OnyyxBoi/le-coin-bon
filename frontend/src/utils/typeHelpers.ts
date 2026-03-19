import type { Vinyl, VinylDisplay } from '@/types'
import { useMockData } from '../composables/useMockData'

/**
 * Convertit un Vinyl en VinylDisplay pour l'affichage dans les composants
 */
export function vinylToDisplay(vinyl: Vinyl): VinylDisplay {
  const { users, genres } = useMockData()
  const owner = users.value.find(u => u.id === vinyl.ownerId)
  const genre = genres.value.find(g => g.id === vinyl.genreId)
  
  return {
    id: vinyl.id,
    title: vinyl.name,
    name: vinyl.name,
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

/**
 * Convertit une liste de Vinyl en VinylDisplay
 */
export function vinylesToDisplay(vinyles: Vinyl[]): VinylDisplay[] {
  return vinyles.map(vinylToDisplay)
}
