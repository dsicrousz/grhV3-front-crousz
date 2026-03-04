export interface Division {
  _id: string
  nom: string
  parent?: string | Division | null
  is_active?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateDivisionDto {
  _id?: string
  nom: string
  parent?: string
}

export interface UpdateDivisionDto {
  _id?: string
  nom?: string
  parent?: string | null
  is_active?: boolean
}

export interface DivisionTree extends Division {
  children: DivisionTree[]
  services: Service[]
}

export interface Service {
  _id: string
  nom: string
  division: string | Division
  is_active?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateServiceDto {
  _id?: string
  nom: string
  division: string
}

export interface UpdateServiceDto {
  _id?: string
  nom?: string
  division?: string
  is_active?: boolean
}
