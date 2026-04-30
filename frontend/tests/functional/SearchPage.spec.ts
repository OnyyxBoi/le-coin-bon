import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { userEvent } from '@testing-library/user-event'
import SearchPage from '@/views/SearchPage.vue'
import HomePage from '@/views/HomePage.vue'

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/search', component: SearchPage }
  ]
})

describe('SearchPage - Tests fonctionnels', () => {
  beforeEach(async () => {
    await router.push('/search')
  })

  it('devrait afficher la barre de recherche', () => {
    const wrapper = mount(SearchPage, {
      global: {
        plugins: [router]
      }
    })
    
    expect(wrapper.text()).toContain('Rechercher un vinyle')
    const searchInput = wrapper.find('input[type="text"]')
    expect(searchInput.exists()).toBe(true)
  })

  it('devrait afficher les filtres par genre', () => {
    const wrapper = mount(SearchPage, {
      global: {
        plugins: [router]
      }
    })

    // Attendre l'init async (mock fetch dans tests/setup.ts)
    return flushPromises().then(async () => {
      await wrapper.vm.$nextTick()
    
      const genreButtons = wrapper.findAll('button')
      const genreButton = genreButtons.find(btn => btn.text().includes('Rock'))
      expect(genreButton).toBeDefined()
    })
  })

  it("devrait afficher le filtre par état", async () => {
    const wrapper = mount(SearchPage, {
      global: {
        plugins: [router]
      }
    })

    await flushPromises()
    await wrapper.vm.$nextTick()

    const select = wrapper.find('select[aria-label="Filtrer par état"]')
    expect(select.exists()).toBe(true)
    expect(wrapper.text()).toContain('État')
  })

  it('devrait permettre de filtrer par genre', async () => {
    const wrapper = mount(SearchPage, {
      global: {
        plugins: [router]
      }
    })
    
    await flushPromises()
    await wrapper.vm.$nextTick()
    
    const rockButton = wrapper.findAll('button').find(btn => btn.text() === 'Rock')
    if (rockButton) {
      await rockButton.trigger('click')
      await wrapper.vm.$nextTick()
      
      // Vérifier que le filtre est actif
      expect(rockButton.classes()).toContain('bg-primary-500')
    }
  })

  it('devrait afficher les suggestions quand aucun filtre n\'est actif', async () => {
    const wrapper = mount(SearchPage, {
      global: {
        plugins: [router]
      }
    })
    
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Suggestions')
  })
})
