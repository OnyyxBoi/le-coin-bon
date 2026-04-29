import { apiFetch } from '../../api/client'
import { mapExchange, mapMessage } from '../../api/mappers'
import type { Exchange, ExchangeFormData, ExchangeStatus, Message, MessageFormData } from '../../types'
import { ensureInitialized, refreshMessagesForExchange } from './initialization'
import { currentUser, exchanges, exchangeMessages } from './state'

export async function createExchange(exchangeData: ExchangeFormData): Promise<Exchange | null> {
  await ensureInitialized()
  if (!currentUser.value.id) return null

  const initiateurId = Number(currentUser.value.id)
  const destinataireId = Number(exchangeData.recipientId)

  const vinylesInitiateur = exchangeData.initiatorVinylIds.map((id) => Number(id))
  const vinylesDestinataire = exchangeData.destinationVinylIds.map((id) => Number(id))

  if (
    Number.isNaN(initiateurId) ||
    Number.isNaN(destinataireId) ||
    vinylesInitiateur.some((id) => Number.isNaN(id)) ||
    vinylesDestinataire.some((id) => Number.isNaN(id))
  ) {
    throw new Error('IDs invalides pour créer un échange.')
  }

  try {
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
    
    alert('Offre envoyée')
    return mapped

  } catch (error: any) {
    console.error('Erreur API Echange:', error)
    
    const errorMsg = error?.message || String(error)
    
    if (errorMsg.toLowerCase().includes('déjà')) {
      alert("Erreur : Ce vinyle est déjà dans un échange.")
    } else {
      alert("Erreur : Données invalides ou erreur serveur.")
    }
    
    throw error
  }
}

export async function updateExchangeStatus(exchangeId: string, status: ExchangeStatus) {
  await ensureInitialized()

  const updatedApi = await apiFetch<any>(`/api/echanges/${encodeURIComponent(exchangeId)}`, {
    method: 'PUT',
    body: JSON.stringify({ statut: status })
  })

  const mapped = mapExchange(updatedApi)
  const index = exchanges.value.findIndex((e) => e.id === exchangeId)
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

export async function addMessageToExchange(exchangeId: string, messageData: MessageFormData): Promise<Message> {
  await ensureInitialized()
  if (!currentUser.value.id) {
    throw new Error("Connecte-toi (sélection d'un utilisateur) avant d'envoyer un message.")
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