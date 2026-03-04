import type { Categorie } from './categorie'

export enum TypeEmploye {
  CDD = "CDD",
  CDI = "CDI"
}

export enum Genre {
  HOMME = "Homme",
  FEMME = "Femme"
}

export enum Civilite {
  MARIE = "MARIE",
  CELIBATAIRE = "CELIBATAIRE",
}

export interface Employe {
  _id: string
  prenom: string
  nom: string
  code?: string
  qualification?: string
  date_de_fin_de_contrat?: string
  date_de_recrutement: string
  telephone: string
  adresse: string
  poste: string
  nationalite: string
  nci: string
  npp?: string
  matricule_de_solde?: string
  genre: Genre
  civilite: Civilite
  nombre_de_parts?: number
  mensualite?: number
  date_de_naissance: string
  lieu_de_naissance?: string
  profile?: string
  categorie?: Categorie
  type: TypeEmploye,
  is_actif?: boolean,
  createdAt?: string
  updatedAt?: string
}

export interface CreateEmployeDto {
  prenom: string
  nom: string
  code?: string
  qualification?: string
  date_de_fin_de_contrat?: string
  date_de_recrutement: string
  telephone: string
  adresse: string
  poste: string
  nationalite: string
  nci: string
  npp?: string
  matricule_de_solde?: string
  genre: Genre
  civilite: Civilite
  nombre_de_parts?: number
  mensualite?: number
  date_de_naissance: string
  lieu_de_naissance?: string
  profile?: string
  categorie?: string
  is_actif?: boolean,
  type: TypeEmploye
}

export interface UpdateEmployeDto {
  prenom?: string
  nom?: string
  code?: string
  qualification?: string
  date_de_fin_de_contrat?: string
  date_de_recrutement?: string
  telephone?: string
  adresse?: string
  poste?: string
  nationalite?: string
  nci?: string
  npp?: string
  matricule_de_solde?: string
  genre?: Genre
  civilite?: Civilite
  nombre_de_parts?: number
  mensualite?: number
  date_de_naissance?: string
  lieu_de_naissance?: string
  profile?: string
  categorie?: string
  is_actif?: boolean,
  type?: TypeEmploye
}
