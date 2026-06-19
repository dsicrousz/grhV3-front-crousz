export interface Site {
  _id: string
  nom: string
  adresse?: string
  ville?: string
  description?: string
  est_actif: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateSiteDto {
  nom: string
  adresse?: string
  ville?: string
  description?: string
}

export interface UpdateSiteDto {
  nom?: string
  adresse?: string
  ville?: string
  description?: string
  est_actif?: boolean
}
