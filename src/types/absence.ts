import type { Employe } from './employe'

export enum TypeAbsence {
  MALADIE = 'maladie',
  PERSONNEL = 'personnel',
  FAMILIAL = 'familial',
  AUTRE = 'autre'
}

export enum StatutDemande {
  EN_ATTENTE = 'en_attente',
  APPROUVEE = 'approuvee',
  REJETEE = 'rejetee'
}

export interface Absence {
  _id: string
  date_debut: string
  date_fin: string
  type: TypeAbsence
  motif?: string
  statut: StatutDemande
  employe: Employe | string
  createdAt?: string
  updatedAt?: string
}

export interface CreateAbsenceDto {
  date_debut: string
  date_fin: string
  type: TypeAbsence
  motif?: string
  statut?: StatutDemande
  employe: string
}

export interface UpdateAbsenceDto {
  date_debut?: string
  date_fin?: string
  type?: TypeAbsence
  motif?: string
  statut?: StatutDemande
}
