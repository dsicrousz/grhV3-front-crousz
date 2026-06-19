import type { Site } from './site'
import type { Division } from './division'

export interface AffectationSite {
  _id: string
  employe: string
  site: Site | string
  division?: Division | string
  service?: { _id: string; nom: string } | string
  date_debut: string
  date_fin?: string
  description?: string
  est_active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateAffectationSiteDto {
  employe: string
  site: string
  division?: string
  service?: string
  date_debut: string
  date_fin?: string
  description?: string
}

export interface UpdateAffectationSiteDto {
  site?: string
  division?: string
  service?: string
  date_debut?: string
  date_fin?: string
  description?: string
}
