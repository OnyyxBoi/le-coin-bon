import { createApp } from './app'
import { DATABASE_FILE, setupDB } from './db'

async function startServer() {
  try {
    const db = await setupDB();
    console.log('Database initialized successfully.', DATABASE_FILE)

    const app = createApp()
    app.locals.db = db

    app.listen(3000, () => {
      console.log('Backend listening on port 3000')
    });
  } catch (error) {
    console.error('Failed to start server:', error)
  }
}

startServer();