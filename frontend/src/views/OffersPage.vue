<template>
  <div class="min-h-[calc(100vh-200px)] py-10 px-5">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold mb-8 text-gray-800">Mes Offres</h1>

      <div class="flex gap-2 mb-8 border-b-2 border-gray-200">
        <button 
          class="px-6 py-3 bg-transparent border-none border-b-[3px] border-transparent text-base font-semibold text-gray-500 cursor-pointer transition-all mb-[-2px] hover:text-gray-700"
          :class="{ 'text-primary-500 border-primary-500': activeTab === 'received' }"
          @click="activeTab = 'received'"
        >
          Offres reçues ({{ receivedExchanges.length }})
        </button>
        <button 
          class="px-6 py-3 bg-transparent border-none border-b-[3px] border-transparent text-base font-semibold text-gray-500 cursor-pointer transition-all mb-[-2px] hover:text-gray-700"
          :class="{ 'text-primary-500 border-primary-500': activeTab === 'sent' }"
          @click="activeTab = 'sent'"
        >
          Offres envoyées ({{ sentExchanges.length }})
        </button>
      </div>

      <div v-if="activeTab === 'received'">
        <div v-if="receivedExchanges.length === 0" class="text-center py-20 px-5 bg-white rounded-2xl shadow-md">
          <EnvelopeIcon class="w-16 h-16 mx-auto mb-6 text-gray-400" />
          <h2 class="text-2xl text-gray-800 mb-3">Aucune offre reçue</h2>
          <p class="text-lg text-gray-500">Les offres que vous recevez apparaîtront ici</p>
        </div>

        <div v-else class="flex flex-col gap-6">
          <div 
            v-for="exchange in receivedExchangesWithDetails" 
            :key="exchange.id" 
            class="bg-white rounded-2xl p-6 shadow-md"
          >
            <div class="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 text-white flex items-center justify-center text-xl font-bold">
                  {{ exchange.initiator?.nickname?.charAt(0).toUpperCase() || '?' }}
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Offre de</p>
                  <p class="text-base font-semibold text-gray-800">{{ exchange.initiator?.nickname || 'Utilisateur inconnu' }}</p>
                </div>
              </div>
              <span 
                class="px-4 py-1.5 rounded-full text-sm font-semibold"
                :class="getStatusClass(exchange.status)"
              >
                {{ getStatusLabel(exchange.status) }}
              </span>
            </div>

            <div class="flex items-center gap-6 mb-6 flex-wrap">
              <div class="flex-1 min-w-[200px]">
                <h4 class="text-sm text-gray-500 mb-3 font-semibold">Vous recevez</h4>
                <div v-if="exchange.initiatorVinyls && exchange.initiatorVinyls.length > 0" class="flex flex-col gap-2">
                  <div v-for="vinyl in exchange.initiatorVinyls" :key="vinyl.id" class="flex gap-3 items-center">
                    <img :src="vinyl.image" :alt="vinyl.name" class="w-[60px] h-[60px] object-cover rounded-lg" />
                    <div>
                      <strong class="block text-sm text-gray-800 mb-1">{{ vinyl.name }}</strong>
                      <p class="text-xs text-gray-500 m-0">{{ vinyl.artist }}</p>
                    </div>
                  </div>
                </div>
                <p v-else class="text-sm text-gray-400">Aucun vinyle</p>
              </div>

              <div class="text-2xl text-primary-500">⇄</div>

              <div class="flex-1 min-w-[200px]">
                <h4 class="text-sm text-gray-500 mb-3 font-semibold">Vous donnez</h4>
                <div v-if="exchange.destinationVinyls && exchange.destinationVinyls.length > 0" class="flex flex-col gap-2">
                  <div v-for="vinyl in exchange.destinationVinyls" :key="vinyl.id" class="flex gap-3 items-center">
                    <img :src="vinyl.image" :alt="vinyl.name" class="w-[60px] h-[60px] object-cover rounded-lg" />
                    <div>
                      <strong class="block text-sm text-gray-800 mb-1">{{ vinyl.name }}</strong>
                      <p class="text-xs text-gray-500 m-0">{{ vinyl.artist }}</p>
                    </div>
                  </div>
                </div>
                <p v-else class="text-sm text-gray-400">Aucun vinyle</p>
              </div>
            </div>

            <div v-if="exchange.status === 'en attente'" class="flex gap-3 flex-wrap">
              <button 
                class="flex-1 min-w-[120px] px-5 py-2.5 border-none rounded-lg text-sm font-semibold cursor-pointer transition-all bg-green-100 text-green-800 hover:bg-green-200 flex items-center justify-center gap-2"
                @click="handleAccept(exchange.id)"
              >
                <CheckIcon class="w-4 h-4" />
                Accepter
              </button>
              <button 
                class="flex-1 min-w-[120px] px-5 py-2.5 border-none rounded-lg text-sm font-semibold cursor-pointer transition-all bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center justify-center gap-2"
                @click="startNegotiation(exchange.id)"
              >
                <ChatBubbleLeftRightIcon class="w-4 h-4" />
                Négocier
              </button>
              <button 
                class="flex-1 min-w-[120px] px-5 py-2.5 border-none rounded-lg text-sm font-semibold cursor-pointer transition-all bg-red-100 text-red-800 hover:bg-red-200 flex items-center justify-center gap-2"
                @click="handleReject(exchange.id)"
              >
                <XMarkIcon class="w-4 h-4" />
                Refuser
              </button>
            </div>

            <div v-if="exchange.status === 'en discussion' && exchange.messages" class="mt-6 pt-6 border-t border-gray-200">
              <div class="flex flex-col gap-3 max-h-[300px] overflow-y-auto mb-4">
                <div 
                  v-for="message in exchange.messages" 
                  :key="message.id"
                  class="p-3 rounded-lg max-w-[80%]"
                  :class="message.userId === currentUser.id 
                    ? 'bg-primary-500 text-white self-end' 
                    : 'bg-gray-100 text-gray-800'"
                >
                  <div class="flex justify-between items-center mb-1 text-xs">
                    <strong class="text-sm">{{ getUserName(message.userId) }}</strong>
                    <span class="opacity-70">{{ formatDate(message.date) }}</span>
                  </div>
                  <p class="text-sm leading-relaxed m-0">{{ message.content }}</p>
                </div>
              </div>
              <div class="flex gap-2">
                <input 
                  v-model="negotiationMessages[exchange.id]" 
                  type="text" 
                  placeholder="Tapez votre message..."
                  class="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                  @keyup.enter="sendMessage(exchange.id)"
                />
                <button 
                  class="px-5 py-2.5 bg-primary-500 text-white border-none rounded-lg text-sm font-semibold cursor-pointer hover:bg-primary-600 transition-all"
                  @click="sendMessage(exchange.id)"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else>
        <div v-if="sentExchanges.length === 0" class="text-center py-20 px-5 bg-white rounded-2xl shadow-md">
          <PaperAirplaneIcon class="w-16 h-16 mx-auto mb-6 text-gray-400" />
          <h2 class="text-2xl text-gray-800 mb-3">Aucune offre envoyée</h2>
          <p class="text-lg text-gray-500">Les offres que vous envoyez apparaîtront ici</p>
        </div>

        <div v-else class="flex flex-col gap-6">
          <div 
            v-for="exchange in sentExchangesWithDetails" 
            :key="exchange.id" 
            class="bg-white rounded-2xl p-6 shadow-md"
          >
            <div class="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 text-white flex items-center justify-center text-xl font-bold">
                  {{ exchange.recipient?.nickname?.charAt(0).toUpperCase() || '?' }}
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Offre à</p>
                  <p class="text-base font-semibold text-gray-800">{{ exchange.recipient?.nickname || 'Utilisateur inconnu' }}</p>
                </div>
              </div>
              <span 
                class="px-4 py-1.5 rounded-full text-sm font-semibold"
                :class="getStatusClass(exchange.status)"
              >
                {{ getStatusLabel(exchange.status) }}
              </span>
            </div>

            <div class="flex items-center gap-6 mb-6 flex-wrap">
              <div class="flex-1 min-w-[200px]">
                <h4 class="text-sm text-gray-500 mb-3 font-semibold">Vous recevez</h4>
                <div v-if="exchange.destinationVinyls && exchange.destinationVinyls.length > 0" class="flex flex-col gap-2">
                  <div v-for="vinyl in exchange.destinationVinyls" :key="vinyl.id" class="flex gap-3 items-center">
                    <img :src="vinyl.image" :alt="vinyl.name" class="w-[60px] h-[60px] object-cover rounded-lg" />
                    <div>
                      <strong class="block text-sm text-gray-800 mb-1">{{ vinyl.name }}</strong>
                      <p class="text-xs text-gray-500 m-0">{{ vinyl.artist }}</p>
                    </div>
                  </div>
                </div>
                <p v-else class="text-sm text-gray-400">Aucun vinyle</p>
              </div>

              <div class="text-2xl text-primary-500">⇄</div>

              <div class="flex-1 min-w-[200px]">
                <h4 class="text-sm text-gray-500 mb-3 font-semibold">Vous donnez</h4>
                <div v-if="exchange.initiatorVinyls && exchange.initiatorVinyls.length > 0" class="flex flex-col gap-2">
                  <div v-for="vinyl in exchange.initiatorVinyls" :key="vinyl.id" class="flex gap-3 items-center">
                    <img :src="vinyl.image" :alt="vinyl.name" class="w-[60px] h-[60px] object-cover rounded-lg" />
                    <div>
                      <strong class="block text-sm text-gray-800 mb-1">{{ vinyl.name }}</strong>
                      <p class="text-xs text-gray-500 m-0">{{ vinyl.artist }}</p>
                    </div>
                  </div>
                </div>
                <p v-else class="text-sm text-gray-400">Aucun vinyle</p>
              </div>
            </div>

            <div v-if="exchange.status === 'en discussion' && exchange.messages" class="mt-6 pt-6 border-t border-gray-200">
              <div class="flex flex-col gap-3 max-h-[300px] overflow-y-auto mb-4">
                <div 
                  v-for="message in exchange.messages" 
                  :key="message.id"
                  class="p-3 rounded-lg max-w-[80%]"
                  :class="message.userId === currentUser.id 
                    ? 'bg-primary-500 text-white self-end' 
                    : 'bg-gray-100 text-gray-800'"
                >
                  <div class="flex justify-between items-center mb-1 text-xs">
                    <strong class="text-sm">{{ getUserName(message.userId) }}</strong>
                    <span class="opacity-70">{{ formatDate(message.date) }}</span>
                  </div>
                  <p class="text-sm leading-relaxed m-0">{{ message.content }}</p>
                </div>
              </div>
              <div class="flex gap-2">
                <input 
                  v-model="negotiationMessages[exchange.id]" 
                  type="text" 
                  placeholder="Tapez votre message..."
                  class="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                  @keyup.enter="sendMessage(exchange.id)"
                />
                <button 
                  class="px-5 py-2.5 bg-primary-500 text-white border-none rounded-lg text-sm font-semibold cursor-pointer hover:bg-primary-600 transition-all"
                  @click="sendMessage(exchange.id)"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  EnvelopeIcon, 
  PaperAirplaneIcon, 
  CheckIcon, 
  ChatBubbleLeftRightIcon, 
  XMarkIcon 
} from '@heroicons/vue/24/outline'
import { useAppData } from '../composables/useAppData'
import type { ExchangeStatus } from '@/types'

const { 
  receivedExchanges, 
  sentExchanges, 
  currentUser, 
  updateExchangeStatus, 
  addMessageToExchange,
  getExchangeWithDetails,
  getUserById,
  exchangeMessages
} = useAppData()

const activeTab = ref<'received' | 'sent'>('received')
const negotiationMessages = ref<Record<string, string>>({})

const receivedExchangesWithDetails = computed(() => {
  return receivedExchanges.value.map(exchange => getExchangeWithDetails(exchange))
})

const sentExchangesWithDetails = computed(() => {
  return sentExchanges.value.map(exchange => getExchangeWithDetails(exchange))
})

function getStatusClass(status: ExchangeStatus) {
  const classes: Record<ExchangeStatus, string> = {
    'en attente': 'bg-yellow-100 text-yellow-800',
    'en discussion': 'bg-blue-100 text-blue-800',
    'accepté': 'bg-green-100 text-green-800',
    'refusé': 'bg-red-100 text-red-800'
  }
  return classes[status] || ''
}

function getStatusLabel(status: ExchangeStatus) {
  const labels: Record<ExchangeStatus, string> = {
    'en attente': 'En attente',
    'en discussion': 'En discussion',
    'accepté': 'Acceptée',
    'refusé': 'Refusée'
  }
  return labels[status] || status
}

function getUserName(userId: string): string {
  const user = getUserById(userId)
  return user?.nickname || 'Utilisateur inconnu'
}

function handleAccept(exchangeId: string) {
  if (confirm('Êtes-vous sûr de vouloir accepter cette offre ?')) {
    updateExchangeStatus(exchangeId, 'accepté')
    alert('Offre acceptée !')
  }
}

function handleReject(exchangeId: string) {
  if (confirm('Êtes-vous sûr de vouloir refuser cette offre ?')) {
    updateExchangeStatus(exchangeId, 'refusé')
  }
}

function startNegotiation(exchangeId: string) {
  updateExchangeStatus(exchangeId, 'en discussion')
}

function sendMessage(exchangeId: string) {
  const message = negotiationMessages.value[exchangeId]
  if (message?.trim()) {
    addMessageToExchange(exchangeId, { content: message })
    negotiationMessages.value[exchangeId] = ''
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
