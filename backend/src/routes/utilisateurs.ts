import { Router } from 'express';
import bcrypt from 'bcrypt';

export const utilisateurRouter = Router();

utilisateurRouter.post('/', async (req, res) => {
  try {
    const { pseudo, email, password } = req.body;
    
    if (!pseudo || !email || !password) {
      return res.status(400).json({ error: 'Pseudo, email et password sont requis' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const db = req.app.locals.db;
    
    try {
      const result = await db.run(
        'INSERT INTO Utilisateur (pseudo, email, password) VALUES (?, ?, ?)',
        [pseudo, email, hashedPassword]
      );
      
      res.status(201).json({ id: result.lastID, pseudo, email });
    } catch (dbError: any) {
      if (dbError.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Cet email est déjà utilisé' });
      }
      throw dbError;
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
  }
});

utilisateurRouter.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const utilisateurs = await db.all('SELECT id, pseudo, email FROM Utilisateur');
    res.json(utilisateurs);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

utilisateurRouter.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const utilisateur = await db.get(
      'SELECT id, pseudo, email FROM Utilisateur WHERE id = ?', 
      [req.params.id]
    );
    
    if (!utilisateur) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(utilisateur);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
  }
});

utilisateurRouter.put('/:id', async (req, res) => {
  try {
    const { pseudo, email, password } = req.body;
    
    if (!pseudo || !email || !password) {
      return res.status(400).json({ error: 'Pseudo, email et password sont requis' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const db = req.app.locals.db;
    const result = await db.run(
      'UPDATE Utilisateur SET pseudo = ?, email = ?, password = ? WHERE id = ?', 
      [pseudo, email, hashedPassword, req.params.id]
    );

    if (result.changes === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json({ id: Number(req.params.id), pseudo, email });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur' });
  }
});

utilisateurRouter.delete('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.run('DELETE FROM Utilisateur WHERE id = ?', [req.params.id]);

    if (result.changes === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});