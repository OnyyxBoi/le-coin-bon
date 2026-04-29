import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { createRouter, createWebHistory } from 'vue-router'

import SearchPage from '@/views/SearchPage.vue'
import VinylDetailPage from '@/views/VinylDetailPage.vue'
import OffersPage from '@/views/OffersPage.vue'
import LoginPage from '@/views/LoginPage.vue'

import { __resetAppDataForTests } from '@/composables/appData/initialization'

type ApiVinyle = {
  id: number
  nom: string
  groupe_artist: string
  genre_id: number | null
  etat: string
  description: string | null
  image: string | null
  utilisateur_id: number
}

describe('Frontend - tests fonctionnels (catalogue + négociation)', () => {
  beforeEach(() => {
    __resetAppDataForTests()

    const genres = [{ id: 1, nom: 'Rock' }]
    const utilisateurs = [
      { id: 1, pseudo: 'alice', email: 'alice@demo.local' },
      { id: 2, pseudo: 'bob', email: 'bob@demo.local' }
    ]
    const vinyles: ApiVinyle[] = [
      {
        id: 1,
        nom: 'Another Light',
        groupe_artist: 'Red Vox',
        genre_id: 1,
        etat: 'Bon',
        description: 'desc',
        image: null,
        utilisateur_id: 2
      },
      {
        id: 2,
        nom: 'Dogrel',
        groupe_artist: 'Fontaines D.C.',
        genre_id: 1,
        etat: 'Très bon',
        description: 'desc',
        image: null,
        utilisateur_id: 1
      }
    ]

    let echanges: any[] = []
    let messages: any[] = []

    // Mock fetch (solution “framework” : tests vitest + happy-dom)
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : String(input)
      const path = url.replace(/^https?:\/\/[^/]+/, '')
      const method = (init?.method || 'GET').toUpperCase()

      const json = (obj: any, status = 200) =>
        new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } })

      if (path === '/api/genres' && method === 'GET') return json(genres)
      if (path === '/api/utilisateurs' && method === 'GET') return json(utilisateurs)
      if (path === '/api/vinyles' && method === 'GET') return json(vinyles)
      if (path === '/api/echanges' && method === 'GET') return json(echanges)

      if (path === '/api/echanges' && method === 'POST') {
        const body = init?.body ? JSON.parse(String(init.body)) : {}
        const created = {
          id: 1,
          initiateur_id: body.initiateur_id,
          destinataire_id: body.destinataire_id,
          vinyles_initiateur: body.vinyles_initiateur,
          vinyles_destinataire: body.vinyles_destinataire,
          statut: 'en attente',
          date: new Date().toISOString()
        }
        echanges = [created]
        return json(created, 201)
      }

      const putExchange = path.match(/^\/api\/echanges\/(\d+)$/)
      if (putExchange && method === 'PUT') {
        const body = init?.body ? JSON.parse(String(init.body)) : {}
        const statut = body.statut
        const valid = ['en attente', 'en discussion', 'accepté', 'refusé']
        if (!valid.includes(statut)) return json({ error: 'Statut invalide' }, 400)
        const current = echanges.find((e) => String(e.id) === putExchange[1])
        if (!current) return json({ error: 'Échange non trouvé' }, 404)
        current.statut = statut
        return json(current, 200)
      }

      const msgList = path.match(/^\/api\/messages\?transaction_id=(.+)$/)
      if (msgList && method === 'GET') {
        const id = decodeURIComponent(msgList[1])
        return json(messages.filter((m) => String(m.transaction_id) === String(id)))
      }

      if (path === '/api/messages' && method === 'POST') {
        const body = init?.body ? JSON.parse(String(init.body)) : {}
        if (!body.transaction_id || !body.utilisateur_id || !body.contenu) {
          return json({ error: 'transaction_id, utilisateur_id, et contenu sont requis' }, 400)
        }
        const created = {
          id: 1,
          transaction_id: body.transaction_id,
          utilisateur_id: body.utilisateur_id,
          contenu: body.contenu,
          date: new Date().toISOString()
        }
        messages = [...messages, created]
        return json(created, 201)
      }

      return json({ error: 'Not mocked' }, 500)
    }) as any

    // Eviter les popups bloquantes dans les tests
    globalThis.alert = vi.fn()
    globalThis.confirm = vi.fn(() => true)
  })

  it('Catalogue: cas extrême (aucun résultat) + erreur (vinyle non trouvé)', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/search', component: SearchPage },
        { path: '/vinyl/:id', component: VinylDetailPage }
      ]
    })

    await router.push('/search')
    render(SearchPage, { global: { plugins: [router] } })

    expect(await screen.findByText('Rechercher un vinyle')).toBeInTheDocument()

    const input = screen.getByPlaceholderText(
      'Rechercher par titre, artiste ou propriétaire...'
    ) as HTMLInputElement
    await fireEvent.update(input, 'zzz___aucun_resultat___zzz')
    expect(await screen.findByText('Aucun résultat trouvé')).toBeInTheDocument()

    // Erreur: vinyle non trouvé (route directe)
    __resetAppDataForTests()
    await router.push('/vinyl/999999')
    render(VinylDetailPage, { global: { plugins: [router] } })
    expect(await screen.findByText('Vinyle non trouvé')).toBeInTheDocument()
  })

  it('Négociation: cas usuel (négocier + envoyer message) + erreur (message vide ignoré)', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/login', component: LoginPage },
        { path: '/offers', component: OffersPage },
        { path: '/account', component: { template: '<div>account</div>' } }
      ]
    })

    // Login bob
    await router.push('/login')
    render(LoginPage, { global: { plugins: [router] } })
    await fireEvent.update(screen.getByPlaceholderText("Nom d'utilisateur"), 'bob')
    await fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }))

    // Aller sur Offers (et simuler qu'un échange existe déjà “en attente” côté API mock via POST)
    // Ici on crée l'échange via l'API mock directement en appelant fetch comme le front le ferait.
    await fetch('http://localhost:3000/api/echanges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        initiateur_id: 1,
        destinataire_id: 2,
        vinyles_initiateur: [2],
        vinyles_destinataire: [1]
      })
    })

    __resetAppDataForTests()
    await router.push('/offers')
    render(OffersPage, { global: { plugins: [router] } })

    // L’onglet "Offres reçues" doit afficher au moins 1 offre
    expect(await screen.findByText(/Offres reçues/)).toBeInTheDocument()

    // Démarrer négociation
    await fireEvent.click(await screen.findByRole('button', { name: 'Négocier' }))
    const messageInput = await screen.findByPlaceholderText('Tapez votre message...')

    // Erreur: message vide -> ne doit pas ajouter de message
    await fireEvent.click(screen.getByRole('button', { name: 'Envoyer' }))
    expect(screen.queryByText('Bonjour, on peut négocier ?')).not.toBeInTheDocument()

    // Usuel: envoyer un message
    await fireEvent.update(messageInput, 'Bonjour, on peut négocier ?')
    await fireEvent.click(screen.getByRole('button', { name: 'Envoyer' }))
    expect(await screen.findByText('Bonjour, on peut négocier ?')).toBeInTheDocument()
  })
})

