import { computed } from 'vue'
import { vinylesToDisplay } from '../utils/typeHelpers'
import {
  addMessageToExchange,
  createExchange,
  updateExchangeStatus
} from './appData/exchangeOperations'
import {
  getExchangeById,
  getExchangeWithDetails,
  getGenreById,
  getUserById,
  getVinylById,
  getVinylDisplayById,
  getVinylWithDetails
} from './appData/getters'
import { ensureInitialized, logoutCurrentUser, setCurrentUserByPseudo } from './appData/initialization'
import { currentUser, exchanges, exchangeMessages, genres, users, vinyles } from './appData/state'
import {
  addVinyl,
  deleteVinyl,
  getSuggestedVinyles,
  getVinylesByGenre,
  searchVinyles,
  updateVinyl
} from './appData/vinylOperations'

export function useAppData() {
  void ensureInitialized().catch(() => {})

  const myVinyles = computed(() =>
    vinylesToDisplay(vinyles.value.filter((v) => v.ownerId === currentUser.value.id))
  )

  const otherVinyles = computed(() =>
    vinylesToDisplay(vinyles.value.filter((v) => v.ownerId !== currentUser.value.id))
  )

  const receivedExchanges = computed(() =>
    exchanges.value.filter((e) => e.recipientId === currentUser.value.id)
  )

  const sentExchanges = computed(() =>
    exchanges.value.filter((e) => e.initiatorId === currentUser.value.id)
  )

  return {
    currentUser,
    users,
    vinyles,
    exchanges,
    exchangeMessages,
    genres,

    myVinyles,
    otherVinyles,
    receivedExchanges,
    sentExchanges,

    getVinylWithDetails,
    getExchangeWithDetails,

    addVinyl,
    updateVinyl,
    deleteVinyl,
    getVinylById,
    getVinylDisplayById,

    searchVinyles,
    getVinylesByGenre,
    getSuggestedVinyles,

    getGenreById,
    getUserById,

    createExchange,
    updateExchangeStatus,
    getExchangeById,

    addMessageToExchange,

    setCurrentUserByPseudo,
    logoutCurrentUser
  }
}
