export interface MotifRupture {
  _id: string
  libelle: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateMotifRuptureDto {
  libelle: string
  description?: string
}

export interface UpdateMotifRuptureDto {
  libelle?: string
  description?: string
}
