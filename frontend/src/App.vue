<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { computed } from 'vue'
import { MusicalNoteIcon } from '@heroicons/vue/24/solid'
import { useAppData } from './composables/useAppData'

const router = useRouter()

const currentPath = computed(() => router.currentRoute.value.path)

const { currentUser, logoutCurrentUser } = useAppData()
const isLoggedIn = computed(() => Boolean(currentUser.value.id))

function handleLogout() {
  logoutCurrentUser()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <header class="bg-white shadow-sm sticky top-0 z-[100]">
      <div class="max-w-7xl mx-auto px-5 flex items-center justify-between h-[70px]">
        <router-link to="/" class="flex items-center gap-3 no-underline text-2xl font-bold text-gray-800 transition-all hover:text-primary-500">
          <MusicalNoteIcon class="w-8 h-8 text-primary-500" />
          <span class="bg-gradient-to-r from-primary-500 to-purple-600 bg-clip-text text-transparent">
            Le Coin Bon
          </span>
        </router-link>
        
        <nav class="flex gap-2 items-center">
          <router-link 
            to="/" 
            class="px-5 py-2.5 no-underline text-gray-500 font-semibold text-[0.95rem] rounded-lg transition-all relative hover:text-primary-500 hover:bg-gray-100"
            :class="{ 'text-primary-500 bg-gray-100': currentPath === '/' }"
          >
            Accueil
            <span 
              v-if="currentPath === '/'"
              class="absolute bottom-0 left-5 right-5 h-[3px] bg-gradient-to-r from-primary-500 to-purple-600 rounded-t-[3px]"
            ></span>
          </router-link>
          <router-link 
            to="/search" 
            class="px-5 py-2.5 no-underline text-gray-500 font-semibold text-[0.95rem] rounded-lg transition-all relative hover:text-primary-500 hover:bg-gray-100"
            :class="{ 'text-primary-500 bg-gray-100': currentPath === '/search' }"
          >
            Rechercher
            <span 
              v-if="currentPath === '/search'"
              class="absolute bottom-0 left-5 right-5 h-[3px] bg-gradient-to-r from-primary-500 to-purple-600 rounded-t-[3px]"
            ></span>
          </router-link>
          <router-link 
            to="/account" 
            class="px-5 py-2.5 no-underline text-gray-500 font-semibold text-[0.95rem] rounded-lg transition-all relative hover:text-primary-500 hover:bg-gray-100"
            :class="{ 'text-primary-500 bg-gray-100': currentPath === '/account' }"
          >
            Mon Compte
            <span 
              v-if="currentPath === '/account'"
              class="absolute bottom-0 left-5 right-5 h-[3px] bg-gradient-to-r from-primary-500 to-purple-600 rounded-t-[3px]"
            ></span>
          </router-link>
          <router-link 
            to="/offers" 
            class="px-5 py-2.5 no-underline text-gray-500 font-semibold text-[0.95rem] rounded-lg transition-all relative hover:text-primary-500 hover:bg-gray-100"
            :class="{ 'text-primary-500 bg-gray-100': currentPath === '/offers' }"
          >
            Mes Offres
            <span 
              v-if="currentPath === '/offers'"
              class="absolute bottom-0 left-5 right-5 h-[3px] bg-gradient-to-r from-primary-500 to-purple-600 rounded-t-[3px]"
            ></span>
          </router-link>
        </nav>

        <div class="flex items-center gap-3">
          <div
            class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm"
          >
            <span class="text-gray-800">
              {{ isLoggedIn ? 'Connecté en tant que ' + currentUser.nickname : 'Non connecté' }}
            </span>
          </div>

          <router-link
            v-if="!isLoggedIn"
            to="/login"
            class="px-4 py-2 rounded-lg text-sm font-semibold no-underline bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 transition-all"
          >
            Login
          </router-link>

          <button
            v-else
            type="button"
            class="px-4 py-2 rounded-lg text-sm font-semibold bg-red-100 text-red-800 hover:bg-red-200 transition-all"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1 min-h-[calc(100vh-140px)]">
      <RouterView />
    </main>

    <footer class="bg-gray-800 text-white py-6 mt-auto">
      <div class="max-w-7xl mx-auto px-5 text-center">
        <p class="m-0 text-gray-400 text-sm">&copy; 2024 Le Coin Bon - Échangez vos vinyles avec passion</p>
      </div>
    </footer>
  </div>
</template>
