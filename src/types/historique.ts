export enum TypeEvenement {
  CONTRAT_CREATION = 'CONTRAT_CREATION',
  CONTRAT_MODIFICATION = 'CONTRAT_MODIFICATION',
  CONTRAT_FIN = 'CONTRAT_FIN',
  AFFECTATION_SITE = 'AFFECTATION_SITE',
  FIN_AFFECTATION_SITE = 'FIN_AFFECTATION_SITE',
  NOMINATION = 'NOMINATION',
  FIN_NOMINATION = 'FIN_NOMINATION',
  MODIFICATION_PROFIL = 'MODIFICATION_PROFIL',
  ACTIVATION = 'ACTIVATION',
  DESACTIVATION = 'DESACTIVATION',
  AUTRE = 'AUTRE',
}

export interface Historique {
  _id: string
  employe: string
  type_evenement: TypeEvenement
  description: string
  details?: Record<string, any>
  auteur?: string
  createdAt: string
  updatedAt?: string
}

export interface CreateHistoriqueDto {
  employe: string
  type_evenement: TypeEvenement
  description: string
  details?: Record<string, any>
  auteur?: string
}
