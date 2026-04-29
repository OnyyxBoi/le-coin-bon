import { describe, it, expect, beforeEach } from 'vitest'
import { setupDB } from '../../src/db'
import { NegotiationCommandService } from '../../src/services/negotiationCommands'
import { ServiceError } from '../../src/services/errors'

describe('CQRS - NegotiationCommandService (tests unitaires)', () => {
  let db: any
  let commands: NegotiationCommandService

  beforeEach(async () => {
    db = await setupDB(':memory:')
    commands = new NegotiationCommandService(db)

    // Données minimales (FK)
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

  it('proposer un échange (cas usuel)', async () => {
    const ex = await commands.proposeExchange({
      initiateur_id: 1,
      destinataire_id: 2,
      vinyles_initiateur: [2],
      vinyles_destinataire: [1]
    })
    expect(ex.id).toBeTypeOf('number')
    expect(ex.statut).toBe('en attente')
  })

  it('proposer un échange (erreur): IDs invalides', async () => {
    await expect(
      commands.proposeExchange({
        initiateur_id: Number.NaN,
        destinataire_id: 2,
        vinyles_initiateur: [2],
        vinyles_destinataire: [1]
      })
    ).rejects.toBeInstanceOf(ServiceError)
  })

  it('changer statut (erreur): statut invalide', async () => {
    const ex = await commands.proposeExchange({
      initiateur_id: 1,
      destinataire_id: 2,
      vinyles_initiateur: [2],
      vinyles_destinataire: [1]
    })

    await expect(commands.setStatus(ex.id, 'nimportequoi' as any)).rejects.toBeInstanceOf(ServiceError)
  })

  it('négocier + message (usuel) et message vide (erreur)', async () => {
    const ex = await commands.proposeExchange({
      initiateur_id: 1,
      destinataire_id: 2,
      vinyles_initiateur: [2],
      vinyles_destinataire: [1]
    })

    const updated = await commands.startNegotiation(ex.id)
    expect(updated.statut).toBe('en discussion')

    await expect(
      commands.addMessage({ transaction_id: ex.id, utilisateur_id: 2, contenu: '   ' })
    ).rejects.toBeInstanceOf(ServiceError)

    const msg = await commands.addMessage({
      transaction_id: ex.id,
      utilisateur_id: 2,
      contenu: 'Bonjour'
    })
    expect(msg.contenu).toBe('Bonjour')
  })
})

