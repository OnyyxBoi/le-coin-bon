<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-5 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
      <div class="flex justify-between items-center p-6 border-b border-gray-200">
        <h2 class="text-2xl font-bold text-gray-800">{{ isEdit ? 'Modifier le vinyle' : 'Ajouter un vinyle' }}</h2>
        <button 
          class="bg-transparent border-none text-3xl text-gray-500 cursor-pointer leading-none p-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-gray-100 hover:text-gray-800"
          @click="$emit('close')"
        >
          ×
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="p-6">
        <div class="mb-5">
          <label class="block mb-2 font-semibold text-gray-700 text-sm">Titre *</label>
          <input 
            v-model="formData.name" 
            type="text" 
            required 
            placeholder="Ex: Dark Side of the Moon"
            class="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          />
        </div>

        <div class="mb-5">
          <label class="block mb-2 font-semibold text-gray-700 text-sm">Artiste *</label>
          <input 
            v-model="formData.artist" 
            type="text" 
            required 
            placeholder="Ex: Pink Floyd"
            class="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          />
        </div>

        <div class="mb-5">
          <label class="block mb-2 font-semibold text-gray-700 text-sm">Genre musical *</label>
          <select 
            v-model="formData.genreId" 
            required
            class="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          >
            <option v-for="genre in genres" :key="genre.id" :value="genre.id">{{ genre.name }}</option>
          </select>
        </div>

        <div class="mb-5">
          <label class="block mb-2 font-semibold text-gray-700 text-sm">État *</label>
          <select 
            v-model="formData.condition" 
            required
            class="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          >
            <option value="Neuf">Neuf</option>
            <option value="Très bon">Très bon</option>
            <option value="Bon">Bon</option>
            <option value="Moyen">Moyen</option>
            <option value="Usé">Usé</option>
          </select>
        </div>

        <div class="mb-5">
          <label class="block mb-2 font-semibold text-gray-700 text-sm">Description</label>
          <textarea 
            v-model="formData.description" 
            rows="4" 
            placeholder="Décrivez l'état de votre vinyle, son histoire..."
            class="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 resize-y"
          ></textarea>
        </div>

        <div class="mb-5">
          <label class="block mb-2 font-semibold text-gray-700 text-sm">URL de l'image</label>
          <input 
            v-model="formData.image" 
            type="url" 
            placeholder="https://..."
            class="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          />
          <div v-if="formData.image" class="mt-3 rounded-lg overflow-hidden border-2 border-gray-200">
            <img :src="formData.image" alt="Preview" class="w-full h-48 object-cover block" />
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button 
            type="button" 
            class="flex-1 px-6 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
            @click="$emit('close')"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            class="flex-1 px-6 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gradient-to-r from-primary-500 to-purple-600 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/40"
          >
            {{ isEdit ? 'Modifier' : 'Ajouter' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { VinylDisplay, VinylFormData } from '@/types'
import { useMockData } from '../composables/useMockData'

interface Props {
  vinyl?: VinylDisplay
}

const props = defineProps<Props>()
const emit = defineEmits<{
  submit: [data: VinylFormData]
  close: []
}>()

const { genres } = useMockData()
const isEdit = computed(() => !!props.vinyl)

const formData = ref<VinylFormData>({
  name: '',
  artist: '',
  genreId: genres.value[0]?.id || '',
  condition: 'Bon',
  description: '',
  image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop'
})

watch(() => props.vinyl, (vinyl) => {
  if (vinyl) {
    formData.value = {
      name: vinyl.name,
      artist: vinyl.artist,
      genreId: vinyl.genreId,
      condition: vinyl.condition,
      description: vinyl.description,
      image: vinyl.image
    }
  }
}, { immediate: true })

function handleSubmit() {
  emit('submit', { ...formData.value })
  emit('close')
}
</script>
