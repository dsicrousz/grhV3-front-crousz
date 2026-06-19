import type { Categorie } from './categorie'
import type { Contrat } from './contrat'
import type { AffectationSite } from './affectation-site'
import type { Nomination } from './nomination'

export enum Genre {
  HOMME = "Homme",
  FEMME = "Femme"
}

export enum Civilite {
  MARIE = "Marié(e)",
  CELIBATAIRE = "Célibataire",
}

export interface Employe {
  _id: string
  prenom: string
  nom: string
  code?: string
  password?: string
  qualification?: string
  telephone: string
  adresse: string
  nationalite: string
  nci: string
  npp?: string
  matricule_de_solde?: string
  genre: Genre
  civilite: Civilite
  nombre_de_parts?: number
  date_de_naissance: string
  lieu_de_naissance?: string
  profile?: string
  categorie?: Categorie
  is_actif?: boolean
  contrat_actif?: Contrat
  affectation_site?: AffectationSite
  nominations?: Nomination[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateEmployeDto {
  prenom: string
  nom: string
  code?: string
  qualification?: string
  telephone: string
  adresse: string
  nationalite: string
  nci: string
  npp?: string
  genre: Genre
  civilite: Civilite
  date_de_naissance: string
  lieu_de_naissance?: string
  profile?: string
  is_actif?: boolean
}

export interface UpdateEmployeDto {
  prenom?: string
  nom?: string
  code?: string
  qualification?: string
  telephone?: string
  adresse?: string
  nationalite?: string
  nci?: string
  npp?: string
  genre?: Genre
  civilite?: Civilite
  date_de_naissance?: string
  lieu_de_naissance?: string
  profile?: string
  is_actif?: boolean
}
