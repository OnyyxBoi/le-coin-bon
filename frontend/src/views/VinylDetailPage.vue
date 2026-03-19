<template>
  <div class="min-h-[calc(100vh-200px)] py-10 px-5">
    <div v-if="vinylDisplay" class="max-w-5xl mx-auto">
      <button 
        class="bg-transparent border-none text-primary-500 text-base font-semibold cursor-pointer mb-6 p-2 transition-all hover:text-purple-600 hover:-translate-x-1 flex items-center gap-2"
        @click="$router.back()"
      >
        <ArrowLeftIcon class="w-5 h-5" />
        Retour
      </button>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white rounded-2xl p-10 shadow-md">
        <div class="sticky top-24 h-fit">
          <img :src="vinylDisplay.image" :alt="vinylDisplay.title" class="w-full aspect-square object-cover rounded-2xl shadow-xl" />
        </div>

        <div class="flex flex-col gap-6">
          <div>
            <h1 class="text-4xl font-bold mb-2 text-gray-800">{{ vinylDisplay.title }}</h1>
            <p class="text-2xl text-gray-500 mb-4 font-medium">{{ vinylDisplay.artist }}</p>
            <div class="flex items-center gap-3 mb-4">
              <span 
                class="inline-block px-4 py-2 rounded-full text-sm font-semibold text-white"
                :class="getConditionClass(vinylDisplay.condition)"
              >
                {{ vinylDisplay.condition }}
              </span>
              <span class="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-primary-100 text-primary-700">
                {{ vinylDisplay.genre }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-4 p-5 bg-gray-50 rounded-xl">
            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold">
              {{ vinylDisplay.ownerName.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">Propriétaire</p>
              <p class="text-lg font-semibold text-gray-800">{{ vinylDisplay.ownerName }}</p>
            </div>
          </div>

          <div>
            <h3 class="text-xl font-semibold text-gray-800 mb-3">Description</h3>
            <p class="text-base text-gray-600 leading-relaxed">{{ vinylDisplay.description || 'Aucune description disponible.' }}</p>
          </div>

          <div v-if="!isMyVinyl" class="mt-auto pt-6">
            <button 
              class="w-full px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-600 text-white border-none rounded-xl text-lg font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/40"
              @click="showOfferModal = true"
            >
              Proposer un échange
            </button>
          </div>
        </div>
      </div>

      <div v-if="suggestedVinyles.length > 0" class="mt-12">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">Vinyles similaires ({{ vinylDisplay.genre }})</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <VinylCard
            v-for="suggested in suggestedVinyles"
            :key="suggested.id"
            :vinyl="suggested"
            :show-owner="true"
            @click="goToVinylDetail(suggested.id)"
          />
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20 px-5">
      <h2 class="text-3xl text-gray-800 mb-6">Vinyle non trouvé</h2>
      <router-link 
        to="/search" 
        class="px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white border-none rounded-xl text-base font-semibold no-underline inline-block transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/40"
      >
        Retour à la recherche
      </router-link>
    </div>

    <OfferModal
      v-if="showOfferModal && vinylDisplay"
      :requested-vinyl="vinylDisplay"
      :my-vinyles="myVinyles"
      @submit="handleOfferSubmit"
      @close="showOfferModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { useMockData } from '../composables/useMockData'
import OfferModal from '@/components/OfferModal.vue'
import VinylCard from '@/components/VinylCard.vue'

const route = useRoute()
const router = useRouter()
const { getVinylDisplayById, myVinyles, currentUser, createExchange, getSuggestedVinyles } = useMockData()

const vinylDisplay = computed(() => getVinylDisplayById(route.params.id as string))
const isMyVinyl = computed(() => vinylDisplay.value?.ownerId === currentUser.value.id)
const showOfferModal = ref(false)

const suggestedVinyles = computed(() => {
  if (!vinylDisplay.value) return []
  return getSuggestedVinyles(vinylDisplay.value.id, 4)
})

function getConditionClass(condition: string) {
  const classes: Record<string, string> = {
    'Neuf': 'bg-green-500',
    'Très bon': 'bg-blue-500',
    'Bon': 'bg-yellow-500',
    'Moyen': 'bg-orange-500',
    'Usé': 'bg-red-500'
  }
  return classes[condition] || 'bg-gray-500'
}

async function handleOfferSubmit(offeredVinylIds: string[]) {
  if (vinylDisplay.value) {
    const vinyl = getVinylDisplayById(vinylDisplay.value.id)
    if (vinyl) {
      const exchange = await createExchange({
        recipientId: vinyl.ownerId,
        initiatorVinylIds: offeredVinylIds,
        destinationVinylIds: [vinyl.id]
      })
      if (exchange) {
        alert('Offre envoyée avec succès !')
        router.push('/offers')
      }
    }
  }
}

function goToVinylDetail(id: string) {
  router.push(`/vinyl/${id}`)
}
</script>
