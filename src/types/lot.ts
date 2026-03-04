export enum StateLot {
  BROUILLON = 'BROUILLON',
  WAITING1 = 'SOUMIS',
  WAITING2 = 'EN COURS DE VALIDATION',
  VALIDE = 'VALIDÉ'
}

export interface Lot {
  _id: string
  libelle: string
  debut: string
  fin: string
  etat: StateLot
  isPublished: boolean,
  url?: string,
  createdAt?: string
  updatedAt?: string
}

export interface CreateLotDto {
  libelle: string
  debut: string
  fin: string
  etat?: string
  isPublished?: boolean}

export interface UpdateLotDto {
  libelle?: string
  debut?: string
  fin?: string
  etat?: string
  isPublished?: boolean
}
