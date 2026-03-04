export interface Categorie {
  _id: string
  code: number
  valeur: number
  estCadre: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateCategorieDto {
  code: number
  valeur: number
  estCadre?: boolean
}

export interface UpdateCategorieDto {
  code?: number
  valeur?: number
  estCadre?: boolean
}
