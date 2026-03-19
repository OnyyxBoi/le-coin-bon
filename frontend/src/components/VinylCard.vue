<template>
  <div 
    class="bg-white rounded-2xl overflow-hidden shadow-md transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1 hover:shadow-xl"
    @click="$emit('click', vinyl)"
  >
    <div class="relative w-full pt-[100%] bg-gradient-to-br from-primary-500 to-purple-600 overflow-hidden">
      <img :src="vinyl.image" :alt="vinyl.title" class="absolute top-0 left-0 w-full h-full object-cover" />
      <div 
        class="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold text-white backdrop-blur-sm"
        :class="conditionClasses[vinyl.condition]"
      >
        {{ vinyl.condition }}
      </div>
    </div>
    <div class="p-4 flex-1 flex flex-col">
      <h3 class="text-lg font-bold mb-1 text-gray-800 leading-tight">{{ vinyl.title }}</h3>
      <p class="text-sm text-gray-500 mb-2 font-medium">{{ vinyl.artist }}</p>
      <div class="flex items-center gap-2 mb-2">
        <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-700">
          {{ vinyl.genre }}
        </span>
      </div>
      <p v-if="showOwner" class="text-xs text-gray-400 mb-2">Par {{ vinyl.ownerName }}</p>
      <p v-if="showDescription" class="text-sm text-gray-600 mt-2 line-clamp-2">{{ vinyl.description }}</p>
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import type { VinylDisplay } from '@/types'

interface Props {
  vinyl: VinylDisplay
  showOwner?: boolean
  showDescription?: boolean
}

withDefaults(defineProps<Props>(), {
  showOwner: false,
  showDescription: false
})

defineEmits<{
  click: [vinyl: VinylDisplay]
}>()

const conditionClasses: Record<string, string> = {
  'Neuf': 'bg-green-500/80',
  'Très bon': 'bg-blue-500/80',
  'Bon': 'bg-yellow-500/80',
  'Moyen': 'bg-orange-500/80',
  'Usé': 'bg-red-500/80'
}
</script>
