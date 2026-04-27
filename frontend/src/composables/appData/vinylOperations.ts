import { apiFetch } from '../../api/client'
import { mapVinyle } from '../../api/mappers'
import type { VinylDisplay, VinylFormData } from '../../types'
import { vinylesToDisplay } from '../../utils/typeHelpers'
import { ensureInitialized } from './initialization'
import { currentUser, users, vinyles } from './state'

export async function addVinyl(vinylData: VinylFormData) {
  await ensureInitialized()
  if (!currentUser.value.id) {
    throw new Error("Connecte-toi (sélection d'un utilisateur) avant d'ajouter un vinyle.")
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

export async function updateVinyl(id: string, updates: VinylFormData) {
  await ensureInitialized()
  if (!currentUser.value.id) {
    throw new Error("Connecte-toi (sélection d'un utilisateur) avant de modifier un vinyle.")
  }

  const index = vinyles.value.findIndex((v) => v.id === id)
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

export async function deleteVinyl(id: string) {
  await ensureInitialized()
  await apiFetch<void>(`/api/vinyles/${encodeURIComponent(id)}`, { method: 'DELETE' })
  vinyles.value = vinyles.value.filter((v) => v.id !== id)
}

export function searchVinyles(query: string, genreId?: string): VinylDisplay[] {
  if (!query.trim() && !genreId) return []
  const lowerQuery = query.toLowerCase()
  const filtered = vinyles.value.filter((v) => {
    if (v.ownerId === currentUser.value.id) return false

    const owner = users.value.find((u) => u.id === v.ownerId)
    const matchesQuery =
      !query.trim() ||
      v.name.toLowerCase().includes(lowerQuery) ||
      v.artist.toLowerCase().includes(lowerQuery) ||
      (owner && owner.nickname.toLowerCase().includes(lowerQuery))
    const matchesGenre = !genreId || v.genreId === genreId
    return matchesQuery && matchesGenre
  })
  return vinylesToDisplay(filtered)
}

export function getVinylesByGenre(genreId: string): VinylDisplay[] {
  return vinylesToDisplay(vinyles.value.filter((v) => v.genreId === genreId))
}

function otherVinylesDisplay(): VinylDisplay[] {
  return vinylesToDisplay(vinyles.value.filter((v) => v.ownerId !== currentUser.value.id))
}

export function getSuggestedVinyles(vinylId?: string, limit: number = 8): VinylDisplay[] {
  const other = otherVinylesDisplay()
  if (!vinylId) {
    return other.slice(0, limit)
  }

  const vinyl = vinyles.value.find((v) => v.id === vinylId)
  if (!vinyl) {
    return other.slice(0, limit)
  }

  const otherVinylesRaw = vinyles.value.filter((v) => v.ownerId !== currentUser.value.id)
  const sameGenre = otherVinylesRaw
    .filter((v) => v.id !== vinylId && v.genreId === vinyl.genreId)
    .slice(0, Math.floor(limit * 0.7))

  const otherGenres = otherVinylesRaw
    .filter((v) => v.id !== vinylId && v.genreId !== vinyl.genreId)
    .slice(0, limit - sameGenre.length)

  return vinylesToDisplay([...sameGenre, ...otherGenres])
}
