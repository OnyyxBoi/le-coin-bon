import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import SearchPage from '@/views/SearchPage.vue'
import AccountPage from '@/views/AccountPage.vue'

// Créer un router pour les tests
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/search', component: SearchPage },
    { path: '/account', component: AccountPage }
  ]
})

describe('HomePage - Tests fonctionnels', () => {
  it('devrait afficher le titre principal', () => {
    const wrapper = mount(HomePage, {
      global: {
        plugins: [router]
      }
    })
    
    expect(wrapper.text()).toContain('Le Coin Bon')
  })

  it('devrait avoir des liens de navigation fonctionnels', async () => {
    const wrapper = mount(HomePage, {
      global: {
        plugins: [router]
      }
    })
    
    const searchLink = wrapper.find('a[href="/search"]')
    const accountLink = wrapper.find('a[href="/account"]')
    
    expect(searchLink.exists()).toBe(true)
    expect(accountLink.exists()).toBe(true)
    expect(searchLink.text()).toContain('Rechercher un vinyle')
    expect(accountLink.text()).toContain('Mes vinyles')
  })

  it('devrait afficher la section "Comment ça marche"', () => {
    const wrapper = mount(HomePage, {
      global: {
        plugins: [router]
      }
    })
    
    expect(wrapper.text()).toContain('Comment ça marche')
    expect(wrapper.text()).toContain('Ajoutez vos vinyles')
    expect(wrapper.text()).toContain('Recherchez')
    expect(wrapper.text()).toContain('Échangez')
  })

  it('devrait afficher les vinyles récents', async () => {
    const wrapper = mount(HomePage, {
      global: {
        plugins: [router]
      }
    })
    
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Vinyles récents')
    // Vérifier qu'il y a des cartes de vinyles
    const vinylCards = wrapper.findAllComponents({ name: 'VinylCard' })
    expect(vinylCards.length).toBeGreaterThan(0)
  })

  it('devrait avoir une animation de vinyle visible', () => {
    const wrapper = mount(HomePage, {
      global: {
        plugins: [router]
      }
    })
    
    const vinylContainer = wrapper.find('.vinyl-container')
    expect(vinylContainer.exists()).toBe(true)
  })
})
