import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/vue'
import * as matchers from '@testing-library/jest-dom/matchers'

// Étendre Vitest avec les matchers de testing-library
expect.extend(matchers)

// Nettoyer après chaque test
afterEach(() => {
  cleanup()
})
