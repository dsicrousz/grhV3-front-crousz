import type { Employe } from './employe'
import type { Rubrique } from './rubrique'

export interface ExclusionSpecifique {
  _id: string
  employe: Employe
  rubrique: Rubrique
  description: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateExclusionSpecifiqueDto {
  employe: string
  rubrique: string
  description: string
}

export interface UpdateExclusionSpecifiqueDto {
  employe?: string
  rubrique?: string
  description?: string
}
