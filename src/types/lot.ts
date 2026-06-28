export enum StateLot {
  BROUILLON = 'BROUILLON',
  WAITING1 = 'SOUMIS',
  WAITING2 = 'EN COURS DE VALIDATION',
  VALIDE = 'VALIDE'
}

export interface Lot {
  _id: string
  libelle: string
  debut: string
  fin: string
  etat: StateLot
  isPublished: boolean,
  isTransmitted: boolean,
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

export interface LotStatistiquesPeriodeParams {
  moisDebut: number
  anneeDebut: number
  moisFin: number
  anneeFin: number
}

export interface LotStatistiquesPeriode {
  moisDebut: number
  anneeDebut: number
  moisFin: number
  anneeFin: number
  dateDebut?: string
  dateFin?: string
  nombreLots?: number
  nombreBulletins?: number
}

export interface LotStatistiquesTotaux {
  brut: number
  net: number
  totalIm: number
  totalNI: number
  totalRet: number
  totalPP: number
  effectif: number
}

export interface LotStatistiquesMensuelles {
  mois: number
  annee: number
  key?: string
  libelle?: string
  nombreLots?: number
  nombreBulletins?: number
  lotCount?: number
  bulletinCount?: number
  brut: number
  net: number
  totalIm: number
  totalNI: number
  totalRet: number
  totalPP: number
  effectif: number
}

export interface LotStatistiquesRubrique {
  code?: string
  libelle: string
  occurrences: number
  totalMontant?: number
  totalBase?: number
  moyenneMontant?: number
  moyenneBase?: number
}

export interface LotStatistiquesLotRubrique extends LotStatistiquesRubrique {}

export interface LotStatistiquesLot {
  _id?: string
  id?: string
  libelle: string
  debut?: string
  fin?: string
  etat?: string
  nombreBulletins?: number
  bulletinCount?: number
  brut: number
  net: number
  totalIm: number
  totalNI: number
  totalRet: number
  totalPP: number
  effectif: number
  rubriques?: LotStatistiquesLotRubrique[]
}

export interface LotStatistiquesPeriodeResponse {
  periode: LotStatistiquesPeriode
  nombreLots?: number
  nombreBulletins?: number
  lotCount?: number
  bulletinCount?: number
  totaux: LotStatistiquesTotaux
  evolutionMensuelle: LotStatistiquesMensuelles[]
  rubriques: LotStatistiquesRubrique[]
  lots: LotStatistiquesLot[]
}
