export enum TypeRubrique {
  IMPOSABLE = 'IMPOSABLE',
  NON_IMPOSABLE = 'NON_IMPOSABLE',
  RETENUE = 'RETENUE'
}

export interface Rubrique {
  _id: string;
  libelle: string;
  code: string;
  type: TypeRubrique;
  taux1: number;
  taux2: number;
  regle_montant: string;
  formule: string;
  regle_base: string;
  add_to_brut: boolean;
  add_to_ipres: boolean;
  ordre: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRubriqueDto {
  libelle: string;
  code: string;
  type: TypeRubrique;
  taux1: number;
  taux2: number;
  regle_montant: string;
  formule: string;
  regle_base: string;
  add_to_brut: boolean;
  add_to_ipres: boolean;
  ordre: number;
}

export interface UpdateRubriqueDto extends Partial<CreateRubriqueDto> {}
