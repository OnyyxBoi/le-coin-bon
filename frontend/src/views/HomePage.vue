<template>
  <div class="min-h-[calc(100vh-200px)]">
    <section class="flex items-center justify-between py-20 px-10 max-w-7xl mx-auto gap-16 flex-wrap">
      <div class="flex-1 max-w-2xl">
        <h1 class="text-5xl font-extrabold mb-4 bg-gradient-to-r from-primary-500 to-purple-600 bg-clip-text text-transparent leading-tight">
          Le Coin Bon
        </h1>
        <p class="text-2xl text-gray-600 mb-4 font-semibold">
          Échangez vos vinyles avec d'autres passionnés
        </p>
        <p class="text-lg text-gray-500 mb-8 leading-relaxed">
          Trouvez le vinyle de vos rêves et proposez un échange. 
          Une communauté de collectionneurs vous attend !
        </p>
        <div class="flex gap-4 flex-wrap">
          <router-link 
            to="/search" 
            class="px-8 py-3.5 rounded-xl text-base font-semibold no-underline inline-block transition-all bg-gradient-to-r from-primary-500 to-purple-600 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/40"
          >
            Rechercher un vinyle
          </router-link>
          <router-link 
            to="/account" 
            class="px-8 py-3.5 rounded-xl text-base font-semibold no-underline inline-block transition-all bg-white text-primary-500 border-2 border-primary-500 hover:bg-gray-50"
          >
            Mes vinyles
          </router-link>
        </div>
      </div>
      <div class="flex-1 flex justify-center items-center">
        <div class="vinyl-container">
          <div class="vinyl-disc">
            <div class="vinyl-grooves">
              <div class="groove groove-1"></div>
              <div class="groove groove-2"></div>
              <div class="groove groove-3"></div>
              <div class="groove groove-4"></div>
              <div class="groove groove-5"></div>
            </div>
            <div class="vinyl-label">
              <div class="label-inner">
                <div class="label-text">Le Coin Bon</div>
              </div>
            </div>
            <div class="vinyl-center"></div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-20 px-10 bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-4xl font-bold text-center mb-12 text-gray-800">Comment ça marche ?</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-white p-8 rounded-2xl text-center shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
            <div class="text-5xl mb-4 flex justify-center">
              <MusicalNoteIcon class="w-16 h-16 text-primary-500" />
            </div>
            <h3 class="text-xl font-bold mb-3 text-gray-800">Ajoutez vos vinyles</h3>
            <p class="text-gray-500 leading-relaxed">Créez votre collection en ajoutant vos vinyles avec photos, descriptions et état</p>
          </div>
          <div class="bg-white p-8 rounded-2xl text-center shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
            <div class="text-5xl mb-4 flex justify-center">
              <MagnifyingGlassIcon class="w-16 h-16 text-primary-500" />
            </div>
            <h3 class="text-xl font-bold mb-3 text-gray-800">Recherchez</h3>
            <p class="text-gray-500 leading-relaxed">Trouvez les vinyles que vous recherchez parmi les collections de la communauté</p>
          </div>
          <div class="bg-white p-8 rounded-2xl text-center shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
            <div class="text-5xl mb-4 flex justify-center">
              <ArrowPathIcon class="w-16 h-16 text-primary-500" />
            </div>
            <h3 class="text-xl font-bold mb-3 text-gray-800">Échangez</h3>
            <p class="text-gray-500 leading-relaxed">Proposez un échange et négociez avec les autres membres</p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-20 px-10">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-4xl font-bold text-center mb-12 text-gray-800">Vinyles récents</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <VinylCard
            v-for="vinyl in recentVinyles"
            :key="vinyl.id"
            :vinyl="vinyl"
            :show-owner="true"
            @click="goToVinylDetail(vinyl.id)"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { MusicalNoteIcon, MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import { useMockData } from '../composables/useMockData'
import VinylCard from '@/components/VinylCard.vue'

const router = useRouter()
const { otherVinyles } = useMockData()

const recentVinyles = computed(() => otherVinyles.value.slice(0, 6))

function goToVinylDetail(id: string) {
  router.push(`/vinyl/${id}`)
}
</script>

<style scoped>
.vinyl-container {
  width: 300px;
  height: 300px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vinyl-disc {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
  position: relative;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    inset 0 0 60px rgba(0, 0, 0, 0.5),
    0 0 0 2px rgba(255, 255, 255, 0.1);
  animation: rotate-vinyl 8s linear infinite;
  overflow: hidden;
}

@keyframes rotate-vinyl {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.vinyl-grooves {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.groove {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.groove-1 {
  width: 60%;
  height: 60%;
  animation: groove-pulse 2s ease-in-out infinite;
}

.groove-2 {
  width: 70%;
  height: 70%;
  animation: groove-pulse 2s ease-in-out infinite 0.2s;
}

.groove-3 {
  width: 80%;
  height: 80%;
  animation: groove-pulse 2s ease-in-out infinite 0.4s;
}

.groove-4 {
  width: 90%;
  height: 90%;
  animation: groove-pulse 2s ease-in-out infinite 0.6s;
}

.groove-5 {
  width: 95%;
  height: 95%;
  animation: groove-pulse 2s ease-in-out infinite 0.8s;
}

@keyframes groove-pulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

.vinyl-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 35%;
  height: 35%;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 0 0 2px rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.label-inner {
  width: 70%;
  height: 70%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.label-text {
  font-size: 0.6rem;
  font-weight: 700;
  color: white;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.05em;
}

.vinyl-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8%;
  height: 8%;
  border-radius: 50%;
  background: #000;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.8),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  z-index: 3;
}

/* Effet de brillance qui tourne */
.vinyl-disc::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 70%
  );
  animation: shine 3s linear infinite;
  pointer-events: none;
}

@keyframes shine {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .vinyl-container {
    width: 200px;
    height: 200px;
  }
  
  .label-text {
    font-size: 0.5rem;
  }
}
</style>
