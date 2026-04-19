import { ref } from 'vue'
import type { User, Vinyl, Exchange, Message, Genre } from '../../types'

export const genres = ref<Genre[]>([])
export const currentUser = ref<User>({ id: '', nickname: '', email: '', password: '' })
export const users = ref<User[]>([])
export const vinyles = ref<Vinyl[]>([])
export const exchanges = ref<Exchange[]>([])
export const exchangeMessages = ref<Record<string, Message[]>>({})
