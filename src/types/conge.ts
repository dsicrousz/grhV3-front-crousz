import type { Employe } from './employe'

export enum TypeConge {
  ANNUEL = 'annuel',
  MALADIE = 'maladie',
  MATERNITE = 'maternite',
  PATERNITE = 'paternite',
  SANS_SOLDE = 'sans_solde',
  EXCEPTIONNEL = 'exceptionnel',
  FORMATION = 'formation',
  AUTRE = 'autre'
}

export enum StatutDemandeConge {
  EN_ATTENTE = 'en_attente',
  APPROUVEE = 'approuvee',
  REJETEE = 'rejetee'
}

export interface Conge {
  _id: string
  date_debut: string
  date_fin: string
  nombre_jours: number
  type: TypeConge
  motif?: string
  statut: StatutDemandeConge
  employe: Employe | string
  createdAt?: string
  updatedAt?: string
}

export interface CreateCongeDto {
  date_debut: string
  date_fin: string
  nombre_jours: number
  type: TypeConge
  motif?: string
  statut?: StatutDemandeConge
  employe: string
}

export interface UpdateCongeDto {
  date_debut?: string
  date_fin?: string
  nombre_jours?: number
  type?: TypeConge
  motif?: string
  statut?: StatutDemandeConge
}

export interface ValidateCongeDto {
  statut: StatutDemandeConge
  commentaire?: string
}

export interface SoldeConges {
  quota: number
  utilises: number
  restants: number
  annee: number
}

export interface CongeStats {
  total: number
  approuves: number
  enAttente: number
  rejetes: number
  joursUtilises: number
}
