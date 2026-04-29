import { Router } from 'express'
import { ServiceError } from '../services/errors'
import { NegotiationCommandService } from '../services/negotiationCommands'
import { NegotiationQueryService } from '../services/negotiationQueries'

export const echangeRouter = Router()

echangeRouter.post('/', async (req, res) => {
  try {
    const db = req.app.locals.db
    const command = new NegotiationCommandService(db)
    const created = await command.proposeExchange(req.body)
    res.status(201).json(created)
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ error: error.message })
    }
    res.status(500).json({ error: "Erreur lors de la création de l'échange" })
  }
})

echangeRouter.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db
    const query = new NegotiationQueryService(db)
    res.json(await query.listExchanges())
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des échanges' })
  }
})

echangeRouter.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db
    const query = new NegotiationQueryService(db)
    res.json(await query.getExchangeById(Number(req.params.id)))
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ error: error.message })
    }
    res.status(500).json({ error: "Erreur lors de la récupération de l'échange" })
  }
})

echangeRouter.put('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db
    const command = new NegotiationCommandService(db)
    res.json(await command.setStatus(Number(req.params.id), req.body?.statut))
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ error: error.message })
    }
    res.status(500).json({ error: "Erreur lors de la mise à jour de l'échange" })
  }
})

echangeRouter.delete('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db
    const result = await db.run('DELETE FROM Echange WHERE id = ?', [req.params.id])

    if (result.changes === 0) return res.status(404).json({ error: 'Échange non trouvé' })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression de l'échange" })
  }
})