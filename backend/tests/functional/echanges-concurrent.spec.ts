import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { setupDB } from '../../src/db';
import { Database } from 'sqlite';

describe('Concurrent Negotiation and Exchange', () => {
  let app: ReturnType<typeof createApp>;
  let db: Database;

  beforeEach(async () => {
    app = createApp();
    db = await setupDB();

    app.locals.db = db;

    await db.run('DELETE FROM Message');
    await db.run('DELETE FROM Echange');
    await db.run('DELETE FROM Vinyle');
    await db.run('DELETE FROM Utilisateur');

    await db.run(`INSERT INTO Utilisateur (id, pseudo, email, password) VALUES 
      (1, "Vendeur", "vendeur@test.com", "pass"), 
      (2, "Acheteur A", "a@test.com", "pass"), 
      (3, "Acheteur B", "b@test.com", "pass")`);
      
    await db.run(`INSERT INTO Vinyle (id, nom, groupe_artist, etat, utilisateur_id) VALUES 
      (1, "Discovery", "Daft Punk", "Mint", 1),
      (2, "Homework", "Daft Punk", "Good", 2)`);
  });

  afterAll(async () => {
    if (db) {
      await db.close();
    }
  });

  it('should handle concurrent exchange requests for the same item gracefully', async () => {
    const payloadA = { 
      initiateur_id: 2, 
      destinataire_id: 1, 
      vinyles_initiateur: [2], 
      vinyles_destinataire: [1] 
    };
    
    const payloadB = { 
      initiateur_id: 3, 
      destinataire_id: 1, 
      vinyles_initiateur: [2], 
      vinyles_destinataire: [1] 
    };

    const requestA = request(app).post('/api/echanges').send(payloadA);
    const requestB = request(app).post('/api/echanges').send(payloadB);

    const [responseA, responseB] = await Promise.all([requestA, requestB]);

    const statuses = [responseA.status, responseB.status];
    
    expect(statuses).toContain(201);
    expect(statuses.some(status => status === 400 || status === 409)).toBe(true);

    const echanges = await db.all('SELECT * FROM Echange');
    expect(echanges.length).toBe(1);
  });
});