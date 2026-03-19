import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'
import HomePage from '@/views/HomePage.vue'
import SearchPage from '@/views/SearchPage.vue'
import AccountPage from '@/views/AccountPage.vue'
import OffersPage from '@/views/OffersPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/search', component: SearchPage },
    { path: '/account', component: AccountPage },
    { path: '/offers', component: OffersPage }
  ]
})

describe('Navigation - Tests fonctionnels end-to-end', () => {
  it('devrait avoir tous les liens de navigation dans le header', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })
    
    const navLinks = wrapper.findAll('a[href]')
    const linkTexts = navLinks.map(link => link.text())
    
    expect(linkTexts).toContain('Accueil')
    expect(linkTexts).toContain('Rechercher')
    expect(linkTexts).toContain('Mon Compte')
    expect(linkTexts).toContain('Mes Offres')
  })

  it('devrait naviguer vers la page de recherche', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })
    
    await router.push('/search')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Rechercher un vinyle')
  })

  it('devrait naviguer vers la page de compte', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })
    
    await router.push('/account')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Mon Compte')
  })

  it('devrait naviguer vers la page des offres', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })
    
    await router.push('/offers')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Mes Offres')
  })
})
