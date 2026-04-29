import { Router } from 'express';
import { ServiceError } from '../services/errors'
import { NegotiationCommandService } from '../services/negotiationCommands'
import { NegotiationQueryService } from '../services/negotiationQueries'

export const messageRouter = Router();

messageRouter.post('/', async (req, res) => {
  try {
    const db = req.app.locals.db
    const command = new NegotiationCommandService(db)
    const created = await command.addMessage(req.body)
    res.status(201).json(created)
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ error: error.message })
    }
    res.status(500).json({ error: 'Erreur lors de la création du message' })
  }
})

messageRouter.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db
    const query = new NegotiationQueryService(db)
    const transaction_id = req.query.transaction_id ? Number(req.query.transaction_id) : undefined
    res.json(await query.listMessages(transaction_id))
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ error: error.message })
    }
    res.status(500).json({ error: 'Erreur lors de la récupération des messages' })
  }
})

messageRouter.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db
    const message = await db.get('SELECT * FROM Message WHERE id = ?', [req.params.id])
    if (!message) return res.status(404).json({ error: 'Message non trouvé' })
    res.json(message)
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du message' })
  }
})

messageRouter.put('/:id', async (req, res) => {
  try {
    const { contenu } = req.body
    if (!contenu) {
      return res.status(400).json({ error: 'Le contenu est requis' })
    }

    const db = req.app.locals.db
    const result = await db.run('UPDATE Message SET contenu = ? WHERE id = ?', [contenu, req.params.id])

    if (result.changes === 0) return res.status(404).json({ error: 'Message non trouvé' })

    const updatedMessage = await db.get('SELECT * FROM Message WHERE id = ?', [req.params.id])
    res.json(updatedMessage)
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du message' })
  }
})

messageRouter.delete('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db
    const result = await db.run('DELETE FROM Message WHERE id = ?', [req.params.id])

    if (result.changes === 0) return res.status(404).json({ error: 'Message non trouvé' })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du message' })
  }
})