import type { Fonction } from './fonction'
import type { Rubrique } from './rubrique'
import { TypeContrat } from './contrat'

export interface AttributionFonctionnelle {
  _id: string
  fonction: Fonction
  rubrique: Rubrique
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
  type_contrat?: TypeContrat
  valeur_par_default?: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateAttributionGlobaleDto {
  rubrique: string
  type_contrat?: TypeContrat
  valeur_par_default?: number
}

export interface UpdateAttributionGlobaleDto {
  rubrique?: string
  type_contrat?: TypeContrat
  valeur_par_default?: number
}
