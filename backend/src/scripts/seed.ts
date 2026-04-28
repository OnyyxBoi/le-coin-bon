/**
 * Peuple la base SQLite avec des utilisateurs et vinyles de démo.
 *
 * Exécution (le fichier SQLite est toujours backend/database.sqlite, voir db.ts) :
 *   yarn seed   (depuis la racine du monorepo)
 *   npm run seed   (dans backend/)
 *
 * Comptes créés (connexion front par pseudo, mot de passe ignoré côté front actuellement) :
 *   alice, bob, charlie, dana — email *@demo.lecoinbon.local, mot de passe côté API : demo123
 *
 * Les vinyles précédemment insérés pour ces emails sont supprimés puis recréés pour pouvoir relancer le script sans doublons.
 */

import bcrypt from 'bcrypt';
import { setupDB } from '../db';

const SEED_EMAIL_DOMAIN = '@demo.lecoinbon.local';
const DEMO_PASSWORD = 'demo123';

type SeedUser = { pseudo: string; emailLocal: string };

const SEED_USERS: SeedUser[] = [
  { pseudo: 'alice', emailLocal: 'alice' },
  { pseudo: 'bob', emailLocal: 'bob' },
  { pseudo: 'charlie', emailLocal: 'charlie' },
  { pseudo: 'dana', emailLocal: 'dana' }
];

const GENRE_NAMES = ['Rock', 'Jazz', 'Pop', 'Électronique', 'Hip-hop', 'Soul', 'Classique'];

type VinyleSeed = {
  nom: string;
  groupe_artist: string;
  genreNom: string;
  etat: string;
  description: string;
  image: string | null;
};

async function ensureGenre(db: Awaited<ReturnType<typeof setupDB>>, nom: string): Promise<number> {
  const row = await db.get<{ id: number }>('SELECT id FROM Genre WHERE nom = ?', [nom]);
  if (row) return row.id;
  const result = await db.run('INSERT INTO Genre (nom) VALUES (?)', [nom]);
  return Number(result.lastID);
}

async function getOrCreateUser(
  db: Awaited<ReturnType<typeof setupDB>>,
  pseudo: string,
  email: string,
  passwordHash: string
): Promise<number> {
  const existing = await db.get<{ id: number }>('SELECT id FROM Utilisateur WHERE email = ?', [email]);
  if (existing) return existing.id;
  const result = await db.run(
    'INSERT INTO Utilisateur (pseudo, email, password) VALUES (?, ?, ?)',
    [pseudo, email, passwordHash]
  );
  return Number(result.lastID);
}

async function clearSeedVinyles(db: Awaited<ReturnType<typeof setupDB>>) {
  await db.run(
    `DELETE FROM Vinyle WHERE utilisateur_id IN (
       SELECT id FROM Utilisateur WHERE email LIKE ?
     )`,
    [`%${SEED_EMAIL_DOMAIN}`]
  );
}

async function clearSeedUsersAndRelatedData(db: Awaited<ReturnType<typeof setupDB>>) {
  const seedUsers = await db.all<{ id: number }[]>(
    'SELECT id FROM Utilisateur WHERE email LIKE ?',
    [`%${SEED_EMAIL_DOMAIN}`]
  )
  const ids = seedUsers.map((u) => Number(u.id)).filter((n) => Number.isFinite(n))
  if (ids.length === 0) return

  const placeholders = ids.map(() => '?').join(',')

  await db.run(
    `DELETE FROM Message
     WHERE utilisateur_id IN (${placeholders})
        OR transaction_id IN (
          SELECT id FROM Echange
          WHERE initiateur_id IN (${placeholders}) OR destinataire_id IN (${placeholders})
        )`,
    [...ids, ...ids, ...ids]
  )

  await db.run(
    `DELETE FROM Echange
     WHERE initiateur_id IN (${placeholders}) OR destinataire_id IN (${placeholders})`,
    [...ids, ...ids]
  )

  await db.run(`DELETE FROM Vinyle WHERE utilisateur_id IN (${placeholders})`, ids)

  await db.run(`DELETE FROM Utilisateur WHERE id IN (${placeholders})`, ids)
}

function vinylsForUser(pseudo: string): VinyleSeed[] {
  const catalog: Record<string, VinyleSeed[]> = {
    alice: [
      {
        nom: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?',
        groupe_artist: 'Billie Eilish',
        genreNom: 'Pop',
        etat: 'Très bon',
        description: 'Premier album studio, pochette soignée.',
        image:
          'https://upload.wikimedia.org/wikipedia/en/3/38/When_We_All_Fall_Asleep%2C_Where_Do_We_Go%3F.png'
      },
      {
        nom: 'Happier Than Ever',
        groupe_artist: 'Billie Eilish',
        genreNom: 'Pop',
        etat: 'Bon',
        description: 'Double vinyle, quelques traces légères sur la pochette.',
        image: 'https://upload.wikimedia.org/wikipedia/en/4/45/Billie_Eilish_-_Happier_Than_Ever.png'
      },
      {
        nom: 'Dogrel',
        groupe_artist: 'Fontaines D.C.',
        genreNom: 'Rock',
        etat: 'Neuf',
        description: 'Début furieux du groupe, pressage récent.',
        image: 'https://upload.wikimedia.org/wikipedia/en/9/9d/Dogrel_album_cover.png'
      },
      {
        nom: 'Everybody Scream',
        groupe_artist: 'Florence + The Machine',
        genreNom: 'Pop',
        etat: 'Bon',
        description: 'Baroque pop / rock atmosphérique.',
        image:
          'https://upload.wikimedia.org/wikipedia/en/c/c9/Florence_and_the_Machine_-_Everybody_Scream.png'
      }
    ],
    bob: [
      {
        nom: 'Another Light',
        groupe_artist: 'Red Vox',
        genreNom: 'Rock',
        etat: 'Bon',
        description: 'Rock indie / power pop, pochette illustrée par Vinny.',
        image: 'https://f4.bcbits.com/img/a0858674410_16.jpg'
      },
      {
        nom: 'What Could Go Wrong',
        groupe_artist: 'Red Vox',
        genreNom: 'Rock',
        etat: 'Très bon',
        description: 'Suite énergique, vinyle noir standard.',
        image: 'https://f4.bcbits.com/img/a3281810013_16.jpg'
      },
      {
        nom: 'Realign',
        groupe_artist: 'Red Vox',
        genreNom: 'Rock',
        etat: 'Moyen',
        description: 'Son encore nickel, léger jaunissement de la pochette.',
        image: 'https://f4.bcbits.com/img/a3061754735_16.jpg'
      },
      {
        nom: "A Hero's Death",
        groupe_artist: 'Fontaines D.C.',
        genreNom: 'Rock',
        etat: 'Très bon',
        description: 'Post-punk irlandais, édition gatefold.',
        image: 'https://upload.wikimedia.org/wikipedia/en/9/9b/A_Hero%27s_Death_Fontaines_DC.jpg'
      }
    ],
    charlie: [
      {
        nom: 'Skinty Fia',
        groupe_artist: 'Fontaines D.C.',
        genreNom: 'Rock',
        etat: 'Neuf',
        description: 'Troisième album, jamais sorti de sa housse.',
        image: 'https://upload.wikimedia.org/wikipedia/en/d/df/Fontaines_D.C._-_Skinty_Fia.png'
      },
      {
        nom: 'Romance',
        groupe_artist: 'Fontaines D.C.',
        genreNom: 'Rock',
        etat: 'Bon',
        description: 'Dernier album en date au moment du seed.',
        image: 'https://upload.wikimedia.org/wikipedia/en/3/31/Romance_Fontaines_D.C._album_cover.jpg'
      }
    ],
    dana: [
      {
        nom: 'HIT ME HARD AND SOFT',
        groupe_artist: 'Billie Eilish',
        genreNom: 'Pop',
        etat: 'Neuf',
        description: 'Encore sous film d’origine.',
        image: 'https://upload.wikimedia.org/wikipedia/en/a/aa/Billie_Eilish_-_Hit_Me_Hard_and_Soft.png'
      },
      {
        nom: 'dont smile at me',
        groupe_artist: 'Billie Eilish',
        genreNom: 'Pop',
        etat: 'Très bon',
        description: 'EP de début, belle dynamique.',
        image: 'https://upload.wikimedia.org/wikipedia/en/2/2f/Billie_Eilish_-_Don%27t_Smile_at_Me.png'
      },
      {
        nom: 'Guitar Songs',
        groupe_artist: 'Billie Eilish',
        genreNom: 'Pop',
        etat: 'Bon',
        description: 'Mini-set acoustique (vinyle / format court selon pressage).',
        image: 'https://upload.wikimedia.org/wikipedia/en/2/26/Billie_Eilish_-_Guitar_Songs.png'
      }
    ]
  };

  return catalog[pseudo] || [];
}

async function main() {
  const db = await setupDB();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const genreByName = new Map<string, number>();
  for (const nom of GENRE_NAMES) {
    const id = await ensureGenre(db, nom);
    genreByName.set(nom, id);
  }


  await clearSeedUsersAndRelatedData(db)
  await clearSeedVinyles(db);

  for (const u of SEED_USERS) {
    const email = `${u.emailLocal}${SEED_EMAIL_DOMAIN}`;
    const id = await getOrCreateUser(db, u.pseudo, email, passwordHash);

    const rows = vinylsForUser(u.pseudo);
    for (const v of rows) {
      const genreId = genreByName.get(v.genreNom) ?? null;
      await db.run(
        `INSERT INTO Vinyle (nom, groupe_artist, genre_id, etat, description, image, utilisateur_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [v.nom, v.groupe_artist, genreId, v.etat, v.description || null, v.image, id]
      );
    }
  }

  const vinylCount = await db.get<{ n: number }>(
    `SELECT COUNT(*) as n FROM Vinyle WHERE utilisateur_id IN (
       SELECT id FROM Utilisateur WHERE email LIKE ?
     )`,
    [`%${SEED_EMAIL_DOMAIN}`]
  );

  console.log('Seed terminé.');
  console.log(`Utilisateurs de démo (mot de passe API « ${DEMO_PASSWORD} ») :`);
  for (const u of SEED_USERS) {
    console.log(`  - pseudo: ${u.pseudo}  |  email: ${u.emailLocal}${SEED_EMAIL_DOMAIN}`);
  }
  console.log(`Vinyles seed en base : ${vinylCount?.n ?? 0}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
