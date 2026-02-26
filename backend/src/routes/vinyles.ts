import { Router } from 'express';

export const vinyleRouter = Router();

vinyleRouter.post('/', async (req, res) => {
  try {
    const { nom, groupe_artist, genre_id, etat, description, image, utilisateur_id } = req.body;
    
    if (!nom || !groupe_artist || !etat || !utilisateur_id) {
      return res.status(400).json({ error: 'nom, groupe_artist, etat, et utilisateur_id sont requis' });
    }

    const db = req.app.locals.db;
    
    try {
      const result = await db.run(
        `INSERT INTO Vinyle (nom, groupe_artist, genre_id, etat, description, image, utilisateur_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nom, groupe_artist, genre_id || null, etat, description || null, image || null, utilisateur_id]
      );
      
      res.status(201).json({ 
        id: result.lastID, nom, groupe_artist, genre_id, etat, description, image, utilisateur_id 
      });
    } catch (dbError: any) {
      if (dbError.message.includes('FOREIGN KEY constraint failed')) {
        return res.status(400).json({ error: 'Le genre_id ou utilisateur_id fourni est invalide' });
      }
      throw dbError;
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du vinyle' });
  }
});

vinyleRouter.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const vinyles = await db.all('SELECT * FROM Vinyle');
    res.json(vinyles);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des vinyles' });
  }
});

vinyleRouter.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const vinyle = await db.get('SELECT * FROM Vinyle WHERE id = ?', [req.params.id]);
    
    if (!vinyle) return res.status(404).json({ error: 'Vinyle non trouvé' });
    res.json(vinyle);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du vinyle' });
  }
});

vinyleRouter.put('/:id', async (req, res) => {
  try {
    const { nom, groupe_artist, genre_id, etat, description, image, utilisateur_id } = req.body;
    
    if (!nom || !groupe_artist || !etat || !utilisateur_id) {
      return res.status(400).json({ error: 'nom, groupe_artist, etat, et utilisateur_id sont requis' });
    }

    const db = req.app.locals.db;
    
    try {
      const result = await db.run(
        `UPDATE Vinyle 
         SET nom = ?, groupe_artist = ?, genre_id = ?, etat = ?, description = ?, image = ?, utilisateur_id = ? 
         WHERE id = ?`, 
        [nom, groupe_artist, genre_id || null, etat, description || null, image || null, utilisateur_id, req.params.id]
      );

      if (result.changes === 0) return res.status(404).json({ error: 'Vinyle non trouvé' });
      res.json({ id: Number(req.params.id), nom, groupe_artist, genre_id, etat, description, image, utilisateur_id });
    } catch (dbError: any) {
      if (dbError.message.includes('FOREIGN KEY constraint failed')) {
        return res.status(400).json({ error: 'Le genre_id ou utilisateur_id fourni est invalide' });
      }
      throw dbError;
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du vinyle' });
  }
});

vinyleRouter.delete('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.run('DELETE FROM Vinyle WHERE id = ?', [req.params.id]);

    if (result.changes === 0) return res.status(404).json({ error: 'Vinyle non trouvé' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du vinyle' });
  }
});