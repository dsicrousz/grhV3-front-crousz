import type { Employe } from './employe'
import type { Rubrique } from './rubrique'

export interface AttributionIndividuelle {
  _id: string
  employe: Employe
  rubrique: Rubrique
  valeur_par_default?: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateAttributionIndividuelleDto {
  employe: string
  rubrique: string
  valeur_par_default?: number
}

export interface UpdateAttributionIndividuelleDto {
  employe?: string
  rubrique?: string
  valeur_par_default?: number
}
