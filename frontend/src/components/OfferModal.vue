<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-5 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
      <div class="flex justify-between items-center p-6 border-b border-gray-200">
        <h2 class="text-2xl font-bold text-gray-800">Proposer un échange</h2>
        <button 
          class="bg-transparent border-none text-3xl text-gray-500 cursor-pointer leading-none p-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-gray-100 hover:text-gray-800"
          @click="$emit('close')"
        >
          ×
        </button>
      </div>

      <div class="p-6">
        <div class="mb-6">
          <h3 class="text-lg text-gray-700 mb-4">Vinyle recherché</h3>
          <div class="flex gap-4 p-4 bg-gray-50 rounded-xl">
            <img :src="requestedVinyl.image" :alt="requestedVinyl.title" class="w-24 h-24 object-cover rounded-lg" />
            <div class="flex-1">
              <h4 class="text-base text-gray-800 mb-1 font-semibold">{{ requestedVinyl.title }}</h4>
              <p class="text-sm text-gray-500 mb-2">{{ requestedVinyl.artist }}</p>
              <span 
                class="inline-block px-3 py-1 rounded-xl text-xs font-semibold text-white"
                :class="getConditionClass(requestedVinyl.condition)"
              >
                {{ requestedVinyl.condition }}
              </span>
            </div>
          </div>
        </div>

        <div class="text-center text-3xl text-primary-500 my-4">⇄</div>

        <div class="mb-6">
          <h3 class="text-lg text-gray-700 mb-4">Vos vinyles à proposer</h3>
          <div v-if="selectedVinylIds.length > 0" class="mb-4">
            <div class="flex flex-wrap gap-2 mb-4">
              <div 
                v-for="vinylId in selectedVinylIds" 
                :key="vinylId"
                class="flex items-center gap-2 px-3 py-2 bg-primary-100 rounded-lg"
              >
                <span class="text-sm font-medium text-primary-700">
                  {{ getVinylById(vinylId)?.title }}
                </span>
                <button 
                  @click="removeVinyl(vinylId)"
                  class="text-primary-700 hover:text-primary-900"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
          <div class="p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <p class="text-gray-500 mb-4 text-center">Sélectionnez un ou plusieurs de vos vinyles</p>
            <div class="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
              <div
                v-for="vinyl in myVinyles"
                :key="vinyl.id"
                class="flex gap-3 p-3 bg-white rounded-lg cursor-pointer transition-all border-2"
                :class="selectedVinylIds.includes(vinyl.id) 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-transparent hover:border-primary-500 hover:translate-x-1'"
                @click="toggleVinyl(vinyl.id)"
              >
                <img :src="vinyl.image" :alt="vinyl.title" class="w-[60px] h-[60px] object-cover rounded-md" />
                <div class="flex-1">
                  <strong class="block mb-1 text-gray-800">{{ vinyl.title }}</strong>
                  <p class="m-0 text-sm text-gray-500">{{ vinyl.artist }}</p>
                </div>
                <div v-if="selectedVinylIds.includes(vinyl.id)" class="text-primary-500">
                  ✓
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-3 p-6 border-t border-gray-200">
        <button 
          type="button" 
          class="flex-1 px-6 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
          @click="$emit('close')"
        >
          Annuler
        </button>
        <button 
          type="button" 
          class="flex-1 px-6 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gradient-to-r from-primary-500 to-purple-600 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="selectedVinylIds.length === 0 || isSubmitting"
          @click="handleSubmit"
        >
          {{ isSubmitting ? 'Envoi...' : "Proposer l'échange" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { VinylDisplay } from '../types'
import { ensureInitialized } from '../composables/appData/initialization'

interface Props {
  requestedVinyl: VinylDisplay
  myVinyles: VinylDisplay[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  submit: [offeredVinylIds: string[]]
  close: []
}>()

void ensureInitialized().catch(() => {})
const selectedVinylIds = ref<string[]>([])
const isSubmitting = ref(false)

function toggleVinyl(vinylId: string) {
  const index = selectedVinylIds.value.indexOf(vinylId)
  if (index > -1) {
    selectedVinylIds.value.splice(index, 1)
  } else {
    selectedVinylIds.value.push(vinylId)
  }
}

function removeVinyl(vinylId: string) {
  const index = selectedVinylIds.value.indexOf(vinylId)
  if (index > -1) {
    selectedVinylIds.value.splice(index, 1)
  }
}

function getVinylById(id: string): VinylDisplay | undefined {
  return props.myVinyles.find(v => v.id === id)
}

function handleSubmit() {
  if (selectedVinylIds.value.length > 0 && !isSubmitting.value) {
    isSubmitting.value = true
    emit('submit', selectedVinylIds.value)
    
    setTimeout(() => {
      isSubmitting.value = false
      emit('close')
    }, 500)
  }
}

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
</script>