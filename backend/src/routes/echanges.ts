import { Router } from 'express';

export const echangeRouter = Router();

echangeRouter.post('/', async (req, res) => {
  try {
    const { initiateur_id, destinataire_id, vinyles_initiateur, vinyles_destinataire } = req.body;
    
    if (!initiateur_id || !destinataire_id || !vinyles_initiateur || !vinyles_destinataire) {
      return res.status(400).json({ error: 'initiateur_id, destinataire_id, vinyles_initiateur, et vinyles_destinataire sont requis' });
    }

    const initiateurStr = JSON.stringify(vinyles_initiateur);
    const destinataireStr = JSON.stringify(vinyles_destinataire);
    const db = req.app.locals.db;
    
    try {
      const result = await db.run(
        `INSERT INTO Echange (initiateur_id, destinataire_id, vinyles_initiateur, vinyles_destinataire) 
         VALUES (?, ?, ?, ?)`,
        [initiateur_id, destinataire_id, initiateurStr, destinataireStr]
      );
      
      res.status(201).json({ 
        id: result.lastID, 
        initiateur_id, 
        destinataire_id, 
        vinyles_initiateur, 
        vinyles_destinataire,
        statut: 'en attente'
      });
    } catch (dbError: any) {
      if (dbError.message.includes('FOREIGN KEY constraint failed')) {
        return res.status(400).json({ error: 'initiateur_id ou destinataire_id invalide' });
      }
      throw dbError;
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de l\'échange' });
  }
});

echangeRouter.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const echanges = await db.all('SELECT * FROM Echange');
    
    const formattedEchanges = echanges.map((e: any) => ({
      ...e,
      vinyles_initiateur: JSON.parse(e.vinyles_initiateur),
      vinyles_destinataire: JSON.parse(e.vinyles_destinataire)
    }));

    res.json(formattedEchanges);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des échanges' });
  }
});

echangeRouter.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const echange = await db.get('SELECT * FROM Echange WHERE id = ?', [req.params.id]);
    
    if (!echange) return res.status(404).json({ error: 'Échange non trouvé' });
    
    echange.vinyles_initiateur = JSON.parse(echange.vinyles_initiateur);
    echange.vinyles_destinataire = JSON.parse(echange.vinyles_destinataire);
    
    res.json(echange);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'échange' });
  }
});

echangeRouter.put('/:id', async (req, res) => {
  try {
    const { statut } = req.body;
    
    if (!statut) {
      return res.status(400).json({ error: 'Le statut est requis' });
    }

    const validStatuses = ['en attente', 'en discussion', 'accepté', 'refusé'];
    if (!validStatuses.includes(statut)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const db = req.app.locals.db;
    const result = await db.run(
      'UPDATE Echange SET statut = ? WHERE id = ?', 
      [statut, req.params.id]
    );

    if (result.changes === 0) return res.status(404).json({ error: 'Échange non trouvé' });
    
    const updatedEchange = await db.get('SELECT * FROM Echange WHERE id = ?', [req.params.id]);
    updatedEchange.vinyles_initiateur = JSON.parse(updatedEchange.vinyles_initiateur);
    updatedEchange.vinyles_destinataire = JSON.parse(updatedEchange.vinyles_destinataire);

    res.json(updatedEchange);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'échange' });
  }
});

echangeRouter.delete('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.run('DELETE FROM Echange WHERE id = ?', [req.params.id]);

    if (result.changes === 0) return res.status(404).json({ error: 'Échange non trouvé' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'échange' });
  }
});