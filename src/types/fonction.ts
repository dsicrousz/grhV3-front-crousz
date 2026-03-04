export interface Fonction {
  _id: string
  nom: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateFonctionDto {
  nom: string
}

export interface UpdateFonctionDto {
  nom?: string
}
