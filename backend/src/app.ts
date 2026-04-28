import express from 'express'
import cors from 'cors'
import { genreRouter } from './routes/genres'
import { utilisateurRouter } from './routes/utilisateurs'
import { vinyleRouter } from './routes/vinyles'
import { echangeRouter } from './routes/echanges'
import { messageRouter } from './routes/messages'

export function createApp() {
  const app = express()
  app.use(cors())
  app.use(express.json())

  app.get('/api/health', (req, res) => {
    res.json({ message: 'OK' })
  })

  app.use('/api/genres', genreRouter)
  app.use('/api/utilisateurs', utilisateurRouter)
  app.use('/api/vinyles', vinyleRouter)
  app.use('/api/echanges', echangeRouter)
  app.use('/api/messages', messageRouter)

  return app
}

