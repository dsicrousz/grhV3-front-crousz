import type { Categorie } from './categorie'
import type { Poste } from './poste'

export enum TypeContrat {
  CDI = 'CDI',
  CDD = 'CDD',
  TEMPORAIRE = 'TEMPORAIRE',
}

export enum MotifTerminaison {
  DEMISSION = 'DEMISSION',
  LICENCIEMENT_ABUSIF = 'LICENCIEMENT_ABUSIF',
  LICENCIEMENT_ECONOMIQUE = 'LICENCIEMENT_ECONOMIQUE',
  LICENCIEMENT_DISCIPLINAIRE = 'LICENCIEMENT_DISCIPLINAIRE',
  RETRAITE = 'RETRAITE',
  DECES = 'DECES',
  FIN_CDD = 'FIN_CDD',
  RUPTURE_CONVENTIONNELLE = 'RUPTURE_CONVENTIONNELLE',
  AUTRE = 'AUTRE',
}

export interface Contrat {
  _id: string
  type: TypeContrat
  date_debut: string
  date_fin?: string
  poste: Poste | string
  salaire_fixe?: number
  description?: string
  est_actif: boolean
  employe: string
  categorie?: Categorie | string
  matricule_de_solde?: string
  nombre_de_parts?: number
  motif_terminaison?: MotifTerminaison
  createdAt?: string
  updatedAt?: string
}

export interface CreateContratDto {
  type: TypeContrat
  date_debut: string
  date_fin?: string
  poste: string
  salaire_fixe?: number
  description?: string
  employe: string
  categorie?: string
  matricule_de_solde?: string
  nombre_de_parts?: number
}

export interface UpdateContratDto {
  type?: TypeContrat
  date_debut?: string
  date_fin?: string
  poste?: string
  salaire_fixe?: number
  description?: string
  categorie?: string
  matricule_de_solde?: string
  nombre_de_parts?: number
}

export interface TerminerContratDto {
  motif_terminaison: MotifTerminaison
  date_fin?: string
}
