<template>
  <div class="min-h-[calc(100vh-200px)] py-10 px-5">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-10 flex-wrap gap-5">
        <h1 class="text-4xl font-bold text-gray-800">Mon Compte</h1>
        <button 
          class="px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/40 flex items-center gap-2"
          @click="showAddForm = true"
        >
          <PlusIcon class="w-5 h-5" />
          Ajouter un vinyle
        </button>
      </div>

      <div v-if="myVinyles.length === 0" class="text-center py-20 px-5 bg-white rounded-2xl shadow-md">
        <MusicalNoteIcon class="w-20 h-20 mx-auto mb-6 text-gray-400" />
        <h2 class="text-2xl text-gray-800 mb-3">Vous n'avez pas encore de vinyles</h2>
        <p class="text-lg text-gray-500 mb-8">Commencez par ajouter votre premier vinyle à votre collection</p>
        <button 
          class="px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/40"
          @click="showAddForm = true"
        >
          Ajouter mon premier vinyle
        </button>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="vinyl in myVinyles" :key="vinyl.id" class="relative">
          <VinylCard :vinyl="vinyl" />
          <div class="flex gap-2 mt-3 justify-center">
            <button 
              class="flex-1 px-4 py-2 border-none rounded-lg text-sm font-semibold cursor-pointer transition-all bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center gap-1"
              @click="editVinyl(vinyl)"
            >
              <PencilIcon class="w-4 h-4" />
              Modifier
            </button>
            <button 
              class="flex-1 px-4 py-2 border-none rounded-lg text-sm font-semibold cursor-pointer transition-all bg-red-100 text-red-700 hover:bg-red-200 flex items-center justify-center gap-1"
              @click="confirmDelete(vinyl)"
            >
              <TrashIcon class="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>

    <VinylForm
      v-if="showAddForm || editingVinyl"
      :vinyl="editingVinyl"
      @submit="handleFormSubmit"
      @close="closeForm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PlusIcon, MusicalNoteIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { useMockData } from '@/composables/useMockData'
import type { VinylDisplay, VinylFormData } from '@/types'
import VinylCard from '@/components/VinylCard.vue'
import VinylForm from '@/components/VinylForm.vue'

const { myVinyles, addVinyl, updateVinyl, deleteVinyl, getVinylById } = useMockData()

const showAddForm = ref(false)
const editingVinyl = ref<VinylDisplay | null>(null)

function editVinyl(vinyl: VinylDisplay) {
  editingVinyl.value = vinyl
}

function confirmDelete(vinyl: VinylDisplay) {
  if (confirm(`Êtes-vous sûr de vouloir supprimer "${vinyl.title}" ?`)) {
    deleteVinyl(vinyl.id)
  }
}

function handleFormSubmit(data: VinylFormData) {
  if (editingVinyl.value) {
    updateVinyl(editingVinyl.value.id, data)
  } else {
    addVinyl(data)
  }
  closeForm()
}

function closeForm() {
  showAddForm.value = false
  editingVinyl.value = null
}
</script>
