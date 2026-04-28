import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../../src/app'
import { setupDB } from '../../src/db'

describe('API - Tests fonctionnels (catalogue + négociation)', () => {
  const app = createApp()

  beforeEach(async () => {
    // Base isolée par test (in-memory)
    const db = await setupDB(':memory:')
    app.locals.db = db

    // Données minimales pour tester le parcours
    const genre = await db.run('INSERT INTO Genre (nom) VALUES (?)', ['Rock'])
    const u1 = await db.run(
      'INSERT INTO Utilisateur (pseudo, email, password) VALUES (?, ?, ?)',
      ['alice', 'alice@demo.local', 'x']
    )
    const u2 = await db.run(
      'INSERT INTO Utilisateur (pseudo, email, password) VALUES (?, ?, ?)',
      ['bob', 'bob@demo.local', 'x']
    )
    await db.run(
      `INSERT INTO Vinyle (nom, groupe_artist, genre_id, etat, description, image, utilisateur_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['Another Light', 'Red Vox', genre.lastID, 'Bon', 'desc', null, u2.lastID]
    )
    await db.run(
      `INSERT INTO Vinyle (nom, groupe_artist, genre_id, etat, description, image, utilisateur_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['Dogrel', 'Fontaines D.C.', genre.lastID, 'Très bon', 'desc', null, u1.lastID]
    )
  })

  it('Catalogue (usuel): GET /api/vinyles retourne une liste', async () => {
    const res = await request(app).get('/api/vinyles')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('Catalogue (erreur): GET /api/vinyles/:id inexistant retourne 404', async () => {
    const res = await request(app).get('/api/vinyles/999999')
    expect(res.status).toBe(404)
    expect(res.body?.error).toContain('Vinyle non trouvé')
  })

  it('Négociation (erreur): POST /api/echanges sans champs requis retourne 400', async () => {
    const res = await request(app).post('/api/echanges').send({ initiateur_id: 1 })
    expect(res.status).toBe(400)
  })

  it('Négociation (usuel + extrême + erreurs): créer échange, changer statut, gérer messages', async () => {
    const create = await request(app).post('/api/echanges').send({
      initiateur_id: 1,
      destinataire_id: 2,
      vinyles_initiateur: [2],
      vinyles_destinataire: [1]
    })
    expect(create.status).toBe(201)
    expect(create.body.statut).toBe('en attente')
    const exchangeId = String(create.body.id)

    // Erreur: statut invalide
    const invalidStatus = await request(app)
      .put(`/api/echanges/${exchangeId}`)
      .send({ statut: 'nimportequoi' })
    expect(invalidStatus.status).toBe(400)

    // Usuel: passer en discussion
    const inDiscussion = await request(app)
      .put(`/api/echanges/${exchangeId}`)
      .send({ statut: 'en discussion' })
    expect(inDiscussion.status).toBe(200)
    expect(inDiscussion.body.statut).toBe('en discussion')

    // Erreur: message vide
    const emptyMsg = await request(app).post('/api/messages').send({
      transaction_id: Number(exchangeId),
      utilisateur_id: 2,
      contenu: ''
    })
    expect(emptyMsg.status).toBe(400)

    // Usuel: envoyer un message
    const msg = await request(app).post('/api/messages').send({
      transaction_id: Number(exchangeId),
      utilisateur_id: 2,
      contenu: 'Bonjour, on peut négocier ?'
    })
    expect(msg.status).toBe(201)
    expect(msg.body.contenu).toBe('Bonjour, on peut négocier ?')

    const list = await request(app).get(`/api/messages?transaction_id=${encodeURIComponent(exchangeId)}`)
    expect(list.status).toBe(200)
    expect(list.body.length).toBeGreaterThan(0)
  })
})

