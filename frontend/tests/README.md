# Tests Fonctionnels - Le Coin Bon

## Structure des tests

Les tests sont organisés pour être **fonctionnels** (end-to-end) et non unitaires. Ils testent les **vues** et la **navigation** pour valider des scénarios complets.

### Organisation

```
tests/
├── setup.ts                    # Configuration globale des tests
├── functional/                 # Tests fonctionnels (E2E)
│   ├── HomePage.spec.ts       # Tests de la page d'accueil
│   ├── SearchPage.spec.ts     # Tests de la page de recherche
│   └── navigation.spec.ts     # Tests de navigation
└── README.md                   # Ce fichier
```

## Principes

1. **Tests fonctionnels** : Les tests portent sur les **vues** (pages) et non sur les composants isolés
2. **Navigation** : Les tests vérifient que la navigation entre les pages fonctionne
3. **Scénarios complets** : Chaque test valide un scénario utilisateur de bout en bout

## Exécution des tests

```bash
# Lancer tous les tests
npm run test

# Lancer les tests en mode watch
npm run test -- --watch

# Lancer les tests avec interface graphique
npm run test:ui

# Lancer les tests avec couverture de code
npm run test:coverage
```

## Exemples de tests

### Test de page
```typescript
it('devrait afficher le titre principal', () => {
  const wrapper = mount(HomePage, {
    global: { plugins: [router] }
  })
  expect(wrapper.text()).toContain('Le Coin Bon')
})
```

### Test de navigation
```typescript
it('devrait naviguer vers la page de recherche', async () => {
  await router.push('/search')
  expect(wrapper.text()).toContain('Rechercher un vinyle')
})
```

## Bonnes pratiques

- ✅ Tester les **vues** (pages complètes)
- ✅ Tester la **navigation** entre les pages
- ✅ Tester les **scénarios utilisateur** complets
- ❌ Ne pas tester les composants isolés (tests unitaires)
- ❌ Ne pas tester les détails d'implémentation
