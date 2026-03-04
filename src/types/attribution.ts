import type { Fonction } from './fonction'
import type { Rubrique } from './rubrique'

export interface AttributionFonctionnelle {
  _id: string
  fonction: string | Fonction
  rubrique: string | Rubrique
  valeur_par_default?: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateAttributionFonctionnelleDto {
  fonction: string
  rubrique: string
  valeur_par_default?: number
}

export interface UpdateAttributionFonctionnelleDto {
  fonction?: string
  rubrique?: string
  valeur_par_default?: number
}

export interface AttributionGlobale {
  _id: string
  rubrique: string | Rubrique
  valeur_par_default?: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateAttributionGlobaleDto {
  rubrique: string
  valeur_par_default?: number
}

export interface UpdateAttributionGlobaleDto {
  rubrique?: string
  valeur_par_default?: number
}
