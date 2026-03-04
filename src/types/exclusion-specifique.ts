import type { Rubrique } from "./rubrique"
import type { Employe } from "./employe"

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
  description?: string
  rubrique?: string
  employe?: string
}
