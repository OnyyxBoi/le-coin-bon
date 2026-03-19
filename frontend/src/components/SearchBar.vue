<template>
  <div class="flex gap-3 w-full max-w-4xl mx-auto">
    <div class="flex-1 relative flex items-center">
      <MagnifyingGlassIcon class="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />
      <input
        v-model="query"
        type="text"
        :placeholder="placeholder"
        class="w-full pl-12 pr-10 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all bg-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
        @input="handleInput"
        @keyup.enter="handleSearch"
      />
      <button 
        v-if="query" 
        class="absolute right-3 bg-transparent border-none text-2xl text-gray-400 cursor-pointer w-6 h-6 flex items-center justify-center rounded-full transition-all hover:bg-gray-100 hover:text-gray-700"
        @click="clearSearch"
      >
        ×
      </button>
    </div>
    <button 
      class="px-8 py-3.5 bg-gradient-to-r from-primary-500 to-purple-600 text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all whitespace-nowrap hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/40 active:translate-y-0"
      @click="handleSearch"
    >
      Rechercher
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

interface Props {
  modelValue: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Rechercher un vinyle...'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [query: string]
}>()

const query = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  query.value = newVal
})

function handleInput() {
  emit('update:modelValue', query.value)
  // Déclencher la recherche automatiquement lors de la saisie
  emit('search', query.value)
}

function handleSearch() {
  emit('search', query.value)
}

function clearSearch() {
  query.value = ''
  emit('update:modelValue', '')
  emit('search', '')
}
</script>
