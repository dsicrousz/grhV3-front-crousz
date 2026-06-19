export interface Poste {
  _id: string
  nom: string
  createdAt?: string
  updatedAt?: string
}

export interface CreatePosteDto {
  nom: string
}

export interface UpdatePosteDto {
  nom?: string
}
