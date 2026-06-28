export interface ParametreBulletin {
  _id: string
  annee: number
  couleur: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateParametreBulletinDto {
  annee: number
  couleur: string
}

export interface UpdateParametreBulletinDto {
  annee?: number
  couleur?: string
}
