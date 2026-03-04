import type { Employe } from './employe'
import type { Fonction } from './fonction'
import type { Division, Service } from './division'

export interface Nomination {
  _id: string
  date: string
  description?: string
  est_active: boolean
  employe: Employe
  fonction: Fonction
  division: Division
  service?: Service
  createdAt?: string
  updatedAt?: string
}

export interface CreateNominationDto {
  date: string
  description?: string
  est_active?: boolean
  employe: string
  fonction: string
  division: string
  service?: string
}

export interface UpdateNominationDto {
  date?: string
  description?: string
  est_active?: boolean
  fonction?: string
  division?: string
  service?: string
}
