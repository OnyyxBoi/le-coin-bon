# le-coin-bon

## Tests

Ce dépôt contient des **tests fonctionnels frontend**, des **tests fonctionnels backend**, et des **tests unitaires** (CQRS) sur la négociation.

### Prérequis

- **Nodejs** + **Yarn**
- (Optionnel) **Playwright** pour les tests E2E (les navigateurs sont téléchargés via `npx playwright install`)

Installation des dépendances :

```bash
yarn install
```

### Frontend : tests fonctionnels (Vitest)

Les tests frontend sont exécutés avec **vitest** (environnement `happy-dom`) et **Testing library**.
Ils mockent api via `fetch` pour éviter de dépendre d'un backend lancé.

Lancer les tests :

```bash
cd frontend
yarn test
```

Fichiers importants :
- **Setup tests + mock api** : `frontend/tests/setup.ts`
- **Tests fonctionnels demandés (catalogue + négociation)** : `frontend/tests/functional/catalogue-negociation.front.spec.ts`

### Backend : tests fonctionnels API (Vitest + Supertest)

Les tests backend vérifient les endpoints `/api/*` via **Supertest**, avec une base sqlite en mémoire (`setupDB(':memory:')`).

Lancer les tests :

```bash
cd backend
yarn test
```

Fichier important !!
- **Tests fonctionnels api (catalogue + négociation)** : `backend/tests/functional/catalogue-negociation.api.spec.ts`

### Backend : CQRS + tests unitaires

La négociation est séparée selon le patron **CQRS** :
- **Commands (écriture)** : `backend/src/services/negotiationCommands.ts`
- **Queries (lecture)** : `backend/src/services/negotiationQueries.ts`

Tests unitaires :
- `backend/tests/unit/negotiationCommands.spec.ts`
- `backend/tests/unit/negotiationQueries.spec.ts`

### E2E Playwright

Un scénario E2E existe avec Playwright.

Installation des navigateurs playwright (une fois) :

```bash
cd frontend
npx playwright install
```

Lancer l'E2E :

```bash
cd frontend
yarn e2e
```

Fichiers :
- Config : `frontend/playwright.config.ts`
- Test : `frontend/tests/e2e/catalogue-negociation.spec.ts`
