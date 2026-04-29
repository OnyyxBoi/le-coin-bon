import type { Database } from 'sqlite'
import { ServiceError } from './errors'

export type ExchangeRow = {
  id: number
  initiateur_id: number
  destinataire_id: number
  vinyles_initiateur: number[]
  vinyles_destinataire: number[]
  statut: string
  date?: string
}

export type MessageRow = {
  id: number
  transaction_id: number
  utilisateur_id: number
  contenu: string
  date?: string
}

function parseJsonArray(value: unknown): number[] {
  if (Array.isArray(value)) return value.map((v) => Number(v)).filter((n) => Number.isFinite(n))
  if (typeof value !== 'string') return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map((v) => Number(v)).filter((n) => Number.isFinite(n)) : []
  } catch {
    return []
  }
}

function mapExchangeRow(row: any): ExchangeRow {
  return {
    ...row,
    vinyles_initiateur: parseJsonArray(row.vinyles_initiateur),
    vinyles_destinataire: parseJsonArray(row.vinyles_destinataire)
  }
}

export class NegotiationQueryService {
  constructor(private readonly db: Database) {}

  async listExchanges(): Promise<ExchangeRow[]> {
    const rows = await this.db.all<any[]>('SELECT * FROM Echange ORDER BY date DESC, id DESC')
    return rows.map(mapExchangeRow)
  }

  async getExchangeById(id: number): Promise<ExchangeRow> {
    if (!Number.isFinite(id)) throw new ServiceError('ID échange invalide', 400)
    const row = await this.db.get<any>('SELECT * FROM Echange WHERE id = ?', [id])
    if (!row) throw new ServiceError('Échange non trouvé', 404)
    return mapExchangeRow(row)
  }

  async listExchangesByUser(userId: number): Promise<ExchangeRow[]> {
    if (!Number.isFinite(userId)) throw new ServiceError('ID utilisateur invalide', 400)
    const rows = await this.db.all<any[]>(
      'SELECT * FROM Echange WHERE initiateur_id = ? OR destinataire_id = ? ORDER BY date DESC, id DESC',
      [userId, userId]
    )
    return rows.map(mapExchangeRow)
  }

  async listMessages(transactionId?: number): Promise<MessageRow[]> {
    if (transactionId !== undefined && !Number.isFinite(transactionId)) {
      throw new ServiceError('transaction_id invalide', 400)
    }
    const rows = transactionId
      ? await this.db.all<any[]>(
          'SELECT * FROM Message WHERE transaction_id = ? ORDER BY date ASC, id ASC',
          [transactionId]
        )
      : await this.db.all<any[]>('SELECT * FROM Message ORDER BY date ASC, id ASC')

    return rows
  }

  async getHistory(exchangeId: number): Promise<{ exchange: ExchangeRow; messages: MessageRow[] }> {
    const exchange = await this.getExchangeById(exchangeId)
    const messages = await this.listMessages(exchangeId)
    return { exchange, messages }
  }
}

