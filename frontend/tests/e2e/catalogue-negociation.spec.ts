import { test, expect } from '@playwright/test'

test.describe.configure({ mode: 'serial' })

test('Catalogue : recherche + filtre "aucun résultat" + vinyle non trouvé', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('link', { name: 'Rechercher un vinyle' }).click()
  await expect(page.getByRole('heading', { name: 'Rechercher un vinyle' })).toBeVisible()

  // aucune correspondance
  const searchInput = page.locator('input[type="text"]')
  await searchInput.fill('zzz___aucun_resultat___zzz')
  await expect(page.getByText('Aucun résultat trouvé')).toBeVisible()

  // page détail inexistante
  await page.goto('/vinyl/999999999')
  await expect(page.getByRole('heading', { name: 'Vinyle non trouvé' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Retour à la recherche' })).toBeVisible()
})

test('Parcours entier ; proposer un échange puis négocier', async ({ page }) => {
  const dialogs: string[] = []
  page.on('dialog', async (d) => {
    dialogs.push(d.message())
    await d.accept()
  })

  // recherche d'un vinyle (bob)
  await page.goto('/search')
  const searchInput = page.locator('input[type="text"]')
  await searchInput.fill('Another Light')
  await expect(page.getByText('résultat', { exact: false })).toBeVisible()

  // Ouvrir la fiche produit
  await page.getByText('Another Light', { exact: false }).first().click()
  await expect(page.getByRole('button', { name: 'Proposer un échange' })).toBeVisible()
  // Vérifier qu'on est bien sur un vinyle appartenant à boby
  await expect(page.getByText('Propriétaire')).toBeVisible()
  await expect(page.getByText('bob', { exact: true })).toBeVisible()

  // porposer un échange (erreur : bouton désactivé si aucune sélection)
  await page.getByRole('button', { name: 'Proposer un échange' }).click()
  const submitOffer = page.getByRole('button', { name: "Proposer l'échange" })
  await expect(submitOffer).toBeDisabled()

  // Sélectionner au moins un vinyle ( Alice par défaut)
  const modal = page.locator('div.fixed.inset-0')
  await expect(modal).toBeVisible()
  const firstMyVinylOptionTitle = modal.locator('strong.block').first()
  await expect(firstMyVinylOptionTitle).toBeVisible()
  await firstMyVinylOptionTitle.click()
  await expect(submitOffer).toBeEnabled()

  await submitOffer.click()

  // Après succès l’app envoie une alerte puis redirige vers /offers
  await expect.poll(() => dialogs.some((m) => m.includes('Offre envoyée'))).toBeTruthy()
  await expect(page).toHaveURL(/\/offers$/)
  await expect(page.getByRole('heading', { name: 'Mes Offres' })).toBeVisible()

  // Se connecter en tant que bob et négocier et envoyer un message
  await page.goto('/login')
  await page.locator('input[type="text"]').fill('bob')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page).toHaveURL(/\/account$/)

  await page.getByRole('link', { name: 'Mes Offres' }).click()
  await expect(page.getByRole('heading', { name: 'Mes Offres' })).toBeVisible()
  const receivedTab = page.getByRole('button', { name: /Offres reçues/ })
  await receivedTab.click()

  await expect
    .poll(async () => {
      const receivedTabText = await receivedTab.innerText()
      const receivedMatch = receivedTabText.match(/\((\d+)\)/)
      return receivedMatch ? Number(receivedMatch[1]) : 0
    })
    .toBeGreaterThan(0)
  await expect(page.getByText('Offre de')).toBeVisible()

  const negotiateButtons = page.getByRole('button', { name: 'Négocier' })
  await expect(negotiateButtons.first()).toBeVisible()
  await negotiateButtons.first().click()
  await expect(page.getByPlaceholder('Tapez votre message...')).toBeVisible()

  await page.getByRole('button', { name: 'Envoyer' }).click()

  // envoyer un message
  await page.getByPlaceholder('Tapez votre message...').fill('Bonjour, on peut discuter des conditions ?')
  await page.getByRole('button', { name: 'Envoyer' }).click()

  await expect(page.getByText('Bonjour, on peut discuter des conditions ?', { exact: true })).toBeVisible()
})

