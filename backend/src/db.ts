import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

/** Toujours le même fichier que le cwd (évite un seed dans backend/ et un serveur lancé depuis la racine). */
export const DATABASE_FILE = path.resolve(__dirname, '..', 'database.sqlite');

export async function setupDB(filename: string = DATABASE_FILE) {
  const db = await open({
    filename,
    driver: sqlite3.Database
  });

  await db.exec('PRAGMA foreign_keys = ON;');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Genre (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Utilisateur (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pseudo TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Vinyle (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      groupe_artist TEXT NOT NULL,
      genre_id INTEGER,
      etat TEXT NOT NULL,
      description TEXT,
      image TEXT,
      utilisateur_id INTEGER NOT NULL,
      FOREIGN KEY (genre_id) REFERENCES Genre(id),
      FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id)
    );

    CREATE TABLE IF NOT EXISTS Echange (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      initiateur_id INTEGER NOT NULL,
      destinataire_id INTEGER NOT NULL,
      vinyles_initiateur TEXT NOT NULL, -- Stored as JSON string e.g., "[1,2]"
      vinyles_destinataire TEXT NOT NULL, -- Stored as JSON string
      statut TEXT DEFAULT 'en attente',
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (initiateur_id) REFERENCES Utilisateur(id),
      FOREIGN KEY (destinataire_id) REFERENCES Utilisateur(id)
    );

    CREATE TABLE IF NOT EXISTS Message (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id INTEGER NOT NULL,
      utilisateur_id INTEGER NOT NULL,
      contenu TEXT NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (transaction_id) REFERENCES Echange(id),
      FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id)
    );
  `);

  return db;
}