import express from 'express';
import cors from 'cors';
import { setupDB } from './db';
import { genreRouter } from './routes/genres';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ message: 'OK' });
});

app.use('/api/genres', genreRouter);

async function startServer() {
  try {
    const db = await setupDB();
    console.log('Database initialized successfully.');

    app.locals.db = db;

    app.listen(3000, () => {
      console.log('Backend listening on port 3000');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();