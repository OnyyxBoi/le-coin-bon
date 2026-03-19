import { Router } from 'express';

export const messageRouter = Router();

messageRouter.post('/', async (req, res) => {
  try {
    const { transaction_id, utilisateur_id, contenu } = req.body;
    
    if (!transaction_id || !utilisateur_id || !contenu) {
      return res.status(400).json({ error: 'transaction_id, utilisateur_id, et contenu sont requis' });
    }

    const db = req.app.locals.db;
    
    try {
      const result = await db.run(
        `INSERT INTO Message (transaction_id, utilisateur_id, contenu) 
         VALUES (?, ?, ?)`,
        [transaction_id, utilisateur_id, contenu]
      );
      
      res.status(201).json({ 
        id: result.lastID, 
        transaction_id, 
        utilisateur_id, 
        contenu,
        date: new Date().toISOString()
      });
    } catch (dbError: any) {
      if (dbError.message.includes('FOREIGN KEY constraint failed')) {
        return res.status(400).json({ error: 'transaction_id ou utilisateur_id invalide' });
      }
      throw dbError;
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du message' });
  }
});

messageRouter.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { transaction_id } = req.query;
    
    if (transaction_id) {
      const messages = await db.all('SELECT * FROM Message WHERE transaction_id = ? ORDER BY date ASC', [transaction_id]);
      return res.json(messages);
    }

    const messages = await db.all('SELECT * FROM Message ORDER BY date ASC');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
  }
});

messageRouter.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const message = await db.get('SELECT * FROM Message WHERE id = ?', [req.params.id]);
    
    if (!message) return res.status(404).json({ error: 'Message non trouvé' });
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du message' });
  }
});

messageRouter.put('/:id', async (req, res) => {
  try {
    const { contenu } = req.body;
    
    if (!contenu) {
      return res.status(400).json({ error: 'Le contenu est requis' });
    }

    const db = req.app.locals.db;
    const result = await db.run(
      'UPDATE Message SET contenu = ? WHERE id = ?', 
      [contenu, req.params.id]
    );

    if (result.changes === 0) return res.status(404).json({ error: 'Message non trouvé' });
    
    const updatedMessage = await db.get('SELECT * FROM Message WHERE id = ?', [req.params.id]);
    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du message' });
  }
});

messageRouter.delete('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.run('DELETE FROM Message WHERE id = ?', [req.params.id]);

    if (result.changes === 0) return res.status(404).json({ error: 'Message non trouvé' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du message' });
  }
});