import type { Employe } from './employe'

export enum TypePieceJointe {
  CONTRAT = 'contrat',
  DIPLOME = 'diplome',
  CV = 'cv',
  PIECE_IDENTITE = 'piece_identite',
  CERTIFICAT_TRAVAIL = 'certificat_travail',
  ATTESTATION = 'attestation',
  FICHE_POSTE = 'fiche_poste',
  EVALUATION = 'evaluation',
  FORMATION = 'formation',
  MEDICAL = 'medical',
  AUTRE = 'autre',
}

export interface PieceJointe {
  _id: string
  nom: string
  nom_fichier?: string
  url?: string
  mimetype?: string
  taille?: number
  type: TypePieceJointe
  description?: string
  date_document?: string
  date_expiration?: string
  employe: Employe | string
  ajoute_par?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreatePieceJointeDto {
  nom: string
  type: TypePieceJointe
  description?: string
  date_document?: string
  date_expiration?: string
  employe: string
}

export interface UpdatePieceJointeDto {
  nom?: string
  type?: TypePieceJointe
  description?: string
  date_document?: string
  date_expiration?: string
}

export interface PieceJointeStats {
  total: number
  parType: Record<TypePieceJointe, number>
  expiresSoon: number
  expired: number
}
