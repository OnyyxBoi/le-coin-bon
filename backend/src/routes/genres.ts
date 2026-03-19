import { Router } from 'express';

export const genreRouter = Router();

genreRouter.post('/', async (req, res) => {
  try {
    const { nom } = req.body;
    if (!nom) return res.status(400).json({ error: 'Le nom du genre est requis' });

    const db = req.app.locals.db;
    const result = await db.run('INSERT INTO Genre (nom) VALUES (?)', [nom]);
    res.status(201).json({ id: result.lastID, nom });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du genre' });
  }
});

genreRouter.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const genres = await db.all('SELECT * FROM Genre');
    res.json(genres);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des genres' });
  }
});

genreRouter.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const genre = await db.get('SELECT * FROM Genre WHERE id = ?', [req.params.id]);
    
    if (!genre) return res.status(404).json({ error: 'Genre non trouvé' });
    res.json(genre);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du genre' });
  }
});

genreRouter.put('/:id', async (req, res) => {
  try {
    const { nom } = req.body;
    if (!nom) return res.status(400).json({ error: 'Le nom du genre est requis' });

    const db = req.app.locals.db;
    const result = await db.run('UPDATE Genre SET nom = ? WHERE id = ?', [nom, req.params.id]);

    if (result.changes === 0) return res.status(404).json({ error: 'Genre non trouvé' });
    res.json({ id: Number(req.params.id), nom });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du genre' });
  }
});

genreRouter.delete('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.run('DELETE FROM Genre WHERE id = ?', [req.params.id]);

    if (result.changes === 0) return res.status(404).json({ error: 'Genre non trouvé' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du genre' });
  }
});