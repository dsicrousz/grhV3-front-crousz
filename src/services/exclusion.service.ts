import Api from './Api'
import { Service } from './Service'
import type { ExclusionSpecifique, CreateExclusionSpecifiqueDto, UpdateExclusionSpecifiqueDto } from '@/types/exclusion'

class ExclusionSpecifiqueServiceClass extends Service {
  constructor() {
    super(Api, 'exclusion-specifique')
  }

  async create(data: CreateExclusionSpecifiqueDto): Promise<ExclusionSpecifique> {
    return super.create(data)
  }

  async getAll(): Promise<ExclusionSpecifique[]> {
    return super.getAll()
  }

  async update(id: string, data: UpdateExclusionSpecifiqueDto): Promise<ExclusionSpecifique> {
    return super.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return super.delete(id)
  }
}

export const ExclusionSpecifiqueService = new ExclusionSpecifiqueServiceClass()
