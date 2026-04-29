import type { Database } from 'sqlite'
import { ServiceError } from './errors'

export type ExchangeStatus = 'en attente' | 'en discussion' | 'accepté' | 'refusé'

export type CreateExchangeInput = {
  initiateur_id: number
  destinataire_id: number
  vinyles_initiateur: number[]
  vinyles_destinataire: number[]
}

const VALID_STATUSES: ExchangeStatus[] = ['en attente', 'en discussion', 'accepté', 'refusé']

function ensureFiniteNumber(value: unknown, label: string): number {
  const n = Number(value)
  if (!Number.isFinite(n)) throw new ServiceError(`${label} invalide`, 400)
  return n
}

function ensureNumberArray(value: unknown, label: string): number[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ServiceError(`${label} est requis`, 400)
  }
  const nums = value.map((v) => Number(v))
  if (nums.some((n) => !Number.isFinite(n))) throw new ServiceError(`${label} invalide`, 400)
  return nums
}

export class NegotiationCommandService {
  constructor(private readonly db: Database) {}

  async proposeExchange(input: CreateExchangeInput) {
    const initiateur_id = ensureFiniteNumber(input.initiateur_id, 'initiateur_id')
    const destinataire_id = ensureFiniteNumber(input.destinataire_id, 'destinataire_id')
    const vinyles_initiateur = ensureNumberArray(input.vinyles_initiateur, 'vinyles_initiateur')
    const vinyles_destinataire = ensureNumberArray(input.vinyles_destinataire, 'vinyles_destinataire')

    try {
      const result = await this.db.run(
        `INSERT INTO Echange (initiateur_id, destinataire_id, vinyles_initiateur, vinyles_destinataire)
         VALUES (?, ?, ?, ?)`,
        [initiateur_id, destinataire_id, JSON.stringify(vinyles_initiateur), JSON.stringify(vinyles_destinataire)]
      )

      return {
        id: Number(result.lastID),
        initiateur_id,
        destinataire_id,
        vinyles_initiateur,
        vinyles_destinataire,
        statut: 'en attente' as const
      }
    } catch (e: any) {
      if (typeof e?.message === 'string' && e.message.includes('FOREIGN KEY constraint failed')) {
        throw new ServiceError('initiateur_id ou destinataire_id invalide', 400)
      }
      throw e
    }
  }

  async setStatus(exchangeId: number, statut: ExchangeStatus) {
    const id = ensureFiniteNumber(exchangeId, 'id')
    if (!VALID_STATUSES.includes(statut)) throw new ServiceError('Statut invalide', 400)

    const result = await this.db.run('UPDATE Echange SET statut = ? WHERE id = ?', [statut, id])
    if (result.changes === 0) throw new ServiceError('Échange non trouvé', 404)

    const updated = await this.db.get<any>('SELECT * FROM Echange WHERE id = ?', [id])
    return {
      ...updated,
      vinyles_initiateur: JSON.parse(updated.vinyles_initiateur),
      vinyles_destinataire: JSON.parse(updated.vinyles_destinataire)
    }
  }

  async accept(exchangeId: number) {
    return this.setStatus(exchangeId, 'accepté')
  }

  async refuse(exchangeId: number) {
    return this.setStatus(exchangeId, 'refusé')
  }

  async startNegotiation(exchangeId: number) {
    return this.setStatus(exchangeId, 'en discussion')
  }

  async addMessage(input: { transaction_id: number; utilisateur_id: number; contenu: string }) {
    const transaction_id = ensureFiniteNumber(input.transaction_id, 'transaction_id')
    const utilisateur_id = ensureFiniteNumber(input.utilisateur_id, 'utilisateur_id')
    const contenu = (typeof input.contenu === 'string' ? input.contenu : '').trim()
    if (!contenu) throw new ServiceError('transaction_id, utilisateur_id, et contenu sont requis', 400)

    try {
      const result = await this.db.run(
        `INSERT INTO Message (transaction_id, utilisateur_id, contenu)
         VALUES (?, ?, ?)`,
        [transaction_id, utilisateur_id, contenu]
      )
      return {
        id: Number(result.lastID),
        transaction_id,
        utilisateur_id,
        contenu,
        date: new Date().toISOString()
      }
    } catch (e: any) {
      if (typeof e?.message === 'string' && e.message.includes('FOREIGN KEY constraint failed')) {
        throw new ServiceError('transaction_id ou utilisateur_id invalide', 400)
      }
      throw e
    }
  }
}

