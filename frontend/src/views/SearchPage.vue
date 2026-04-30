<template>
  <div class="min-h-[calc(100vh-200px)] py-10 px-5">
    <div class="max-w-7xl mx-auto">
      <div class="mb-12">
        <h1 class="text-4xl font-bold mb-6 text-gray-800 text-center">Rechercher un vinyle</h1>
        <SearchBar 
          v-model="searchQuery" 
          @search="handleSearch"
          placeholder="Rechercher par titre, artiste ou propriétaire..."
        />
        <div class="mt-4 flex justify-center">
          <div class="inline-flex rounded-xl border-2 border-gray-200 bg-white shadow-sm overflow-hidden">
            <button
              type="button"
              class="px-4 py-2.5 text-sm font-semibold transition-all border-r border-gray-200"
              :class="selectedCondition === '' ? 'bg-gray-100 text-gray-800' : 'bg-white text-gray-600 hover:bg-gray-50'"
              @click="setCondition('')"
            >
              Tous
            </button>
            <button
              v-for="c in conditions"
              :key="c"
              type="button"
              class="px-4 py-2.5 text-sm font-semibold transition-all border-r border-gray-200 last:border-r-0"
              :class="getConditionClass(c)"
              @click="setCondition(c)"
            >
              {{ c }}
            </button>
          </div>
        </div>
        <div class="mt-4 flex flex-wrap gap-2 justify-center">
          <button
            v-for="genre in genres"
            :key="genre.id"
            @click="toggleGenre(genre.id)"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            :class="selectedGenreId === genre.id 
              ? 'bg-primary-500 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            {{ genre.name }}
          </button>
          <button
            v-if="selectedGenreId"
            @click="clearGenre"
            class="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all"
          >
            Effacer filtre
          </button>
        </div>
      </div>

      <div v-if="hasActiveSearch && searchResults.length === 0" class="text-center py-20 px-5 bg-white rounded-2xl shadow-md">
        <MagnifyingGlassIcon class="w-16 h-16 mx-auto mb-6 text-gray-400" />
        <h2 class="text-2xl text-gray-800 mb-3">Aucun résultat trouvé</h2>
        <p class="text-lg text-gray-500">Essayez avec d'autres mots-clés ou un autre filtre</p>
      </div>

      <div v-else-if="hasActiveSearch && searchResults.length > 0" class="mt-10">
        <h2 class="text-2xl font-semibold text-gray-700 mb-6">
          {{ searchResults.length }} résultat{{ searchResults.length > 1 ? 's' : '' }} trouvé{{ searchResults.length > 1 ? 's' : '' }}
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <VinylCard
            v-for="vinyl in searchResults"
            :key="vinyl.id"
            :vinyl="vinyl"
            :show-owner="true"
            :show-description="true"
            @click="goToVinylDetail(vinyl.id)"
          />
        </div>
      </div>

      <div v-else class="mt-10">
        <h2 class="text-2xl font-semibold text-gray-700 mb-3">Suggestions</h2>
        <p class="text-base text-gray-500 mb-6">Commencez à taper pour rechercher un vinyle ou sélectionnez un genre</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <VinylCard
            v-for="vinyl in suggestedVinyles"
            :key="vinyl.id"
            :vinyl="vinyl"
            :show-owner="true"
            @click="goToVinylDetail(vinyl.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { useAppData } from '../composables/useAppData'
import type { Vinyl } from '../types'
import SearchBar from '@/components/SearchBar.vue'
import VinylCard from '@/components/VinylCard.vue'

const router = useRouter()
const { otherVinyles, searchVinyles, genres } = useAppData()

const searchQuery = ref('')
const selectedGenreId = ref<string | undefined>(undefined)
const selectedCondition = ref<Vinyl['condition'] | ''>('')
const searchResults = ref<ReturnType<typeof searchVinyles>>([])

const conditions = ['Neuf', 'Très bon', 'Bon', 'Moyen', 'Usé'] as const

const suggestedVinyles = computed(() => {
  if (selectedGenreId.value) {
    // Si un genre est sélectionné, montrer les vinyles de ce genre
    return otherVinyles.value
      .filter((v) => v.genreId === selectedGenreId.value)
      .slice(0, 8)
  }
  return otherVinyles.value.slice(0, 8)
})

const hasActiveSearch = computed(() => {
  return (
    searchQuery.value.trim().length > 0 ||
    selectedGenreId.value !== undefined ||
    selectedCondition.value !== ''
  )
})

// Recherche automatique quand la query change
watch([searchQuery, selectedGenreId, selectedCondition], () => {
  performSearch()
})

function performSearch() {
  const query = searchQuery.value.trim()
  const condition = selectedCondition.value || undefined
  if (query || selectedGenreId.value || condition) {
    searchResults.value = searchVinyles(query, selectedGenreId.value, condition)
  } else {
    searchResults.value = []
  }
}

function handleSearch(query: string) {
  searchQuery.value = query
  performSearch()
}

function toggleGenre(genreId: string) {
  if (selectedGenreId.value === genreId) {
    selectedGenreId.value = undefined
  } else {
    selectedGenreId.value = genreId
  }
  performSearch()
}

function clearGenre() {
  selectedGenreId.value = undefined
  performSearch()
}

function setCondition(condition: Vinyl['condition'] | '') {
  selectedCondition.value = selectedCondition.value === condition ? '' : condition
  performSearch()
}

function getConditionClass(condition: Vinyl['condition']) {
  const selected = selectedCondition.value === condition
  const base = 'hover:brightness-95'
  const palette: Record<Vinyl['condition'], { on: string; off: string }> = {
    Neuf: {
      on: 'bg-emerald-100 text-emerald-900',
      off: 'bg-white text-emerald-800 hover:bg-emerald-50'
    },
    'Très bon': {
      on: 'bg-green-100 text-green-900',
      off: 'bg-white text-green-800 hover:bg-green-50'
    },
    Bon: {
      on: 'bg-yellow-100 text-yellow-900',
      off: 'bg-white text-yellow-800 hover:bg-yellow-50'
    },
    Moyen: {
      on: 'bg-orange-100 text-orange-900',
      off: 'bg-white text-orange-800 hover:bg-orange-50'
    },
    'Usé': {
      on: 'bg-red-100 text-red-900',
      off: 'bg-white text-red-800 hover:bg-red-50'
    }
  }
  return `${selected ? palette[condition].on : palette[condition].off} ${base}`
}

function goToVinylDetail(id: string) {
  router.push(`/vinyl/${id}`)
}
</script>
