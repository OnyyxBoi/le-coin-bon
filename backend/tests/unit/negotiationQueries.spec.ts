import { describe, it, expect, beforeEach } from 'vitest'
import { setupDB } from '../../src/db'
import { NegotiationCommandService } from '../../src/services/negotiationCommands'
import { NegotiationQueryService } from '../../src/services/negotiationQueries'
import { ServiceError } from '../../src/services/errors'

describe('CQRS - NegotiationQueryService (tests unitaires)', () => {
  let db: any
  let commands: NegotiationCommandService
  let queries: NegotiationQueryService

  beforeEach(async () => {
    db = await setupDB(':memory:')
    commands = new NegotiationCommandService(db)
    queries = new NegotiationQueryService(db)

    const g = await db.run('INSERT INTO Genre (nom) VALUES (?)', ['Rock'])
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
      ['Another Light', 'Red Vox', g.lastID, 'Bon', 'desc', null, u2.lastID]
    )
    await db.run(
      `INSERT INTO Vinyle (nom, groupe_artist, genre_id, etat, description, image, utilisateur_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['Dogrel', 'Fontaines D.C.', g.lastID, 'Très bon', 'desc', null, u1.lastID]
    )
  })

  it('liste des échanges (usuel) + filtrage par utilisateur', async () => {
    await commands.proposeExchange({
      initiateur_id: 1,
      destinataire_id: 2,
      vinyles_initiateur: [2],
      vinyles_destinataire: [1]
    })

    const all = await queries.listExchanges()
    expect(all.length).toBe(1)

    const byUser2 = await queries.listExchangesByUser(2)
    expect(byUser2.length).toBe(1)
  })

  it('getExchangeById (erreur): échange inexistant', async () => {
    await expect(queries.getExchangeById(9999)).rejects.toBeInstanceOf(ServiceError)
  })

  it('historique (usuel): échange + messages', async () => {
    const ex = await commands.proposeExchange({
      initiateur_id: 1,
      destinataire_id: 2,
      vinyles_initiateur: [2],
      vinyles_destinataire: [1]
    })
    await commands.startNegotiation(ex.id)
    await commands.addMessage({ transaction_id: ex.id, utilisateur_id: 2, contenu: 'Hello' })

    const history = await queries.getHistory(ex.id)
    expect(history.exchange.id).toBe(ex.id)
    expect(history.messages.length).toBe(1)
    expect(history.messages[0]?.contenu).toBe('Hello')
  })
})

