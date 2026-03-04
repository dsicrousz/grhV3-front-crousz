import type { Employe } from './employe'
import type { Lot } from './lot'

export interface LigneBulletin {
  rubrique: string
  libelle: string
  base?: number
  taux?: number
  montant: number
  type: 'gain' | 'retenue'
}

export interface Bulletin {
  _id: string
  employe: Employe | string
  lot: Lot | string
  lignes: LigneBulletin[]
  totalIm: number
  totalNI: number
  totalRet: number
  totalPP: number
  nap: number
  url?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateBulletinDto {
  employe: string
  lot: string
  lignes: object
  totalIm: number
  totalNI: number
  totalRet: number
  totalPP: number
  nap: number
  url?: string
}

export interface UpdateBulletinDto {
  lignes?: object
  totalIm?: number
  totalNI?: number
  totalRet?: number
  totalPP?: number
  nap?: number
  url?: string
}
