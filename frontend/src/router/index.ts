import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import LoginPage from '@/views/LoginPage.vue'
import AccountPage from '@/views/AccountPage.vue'
import SearchPage from '@/views/SearchPage.vue'
import VinylDetailPage from '@/views/VinylDetailPage.vue'
import OffersPage from '@/views/OffersPage.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/login', component: LoginPage },
  { path: '/account', component: AccountPage },
  { path: '/search', component: SearchPage },
  { path: '/vinyl/:id', component: VinylDetailPage },
  { path: '/offers', component: OffersPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
