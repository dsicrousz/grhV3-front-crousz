import type { CreateExclusionSpecifiqueDto, ExclusionSpecifique, UpdateExclusionSpecifiqueDto } from '@/types/exclusion-specifique'
import Api from './Api'
import { Service } from './Service'

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

  async getOne(id: string): Promise<ExclusionSpecifique> {
    return super.getOne(id)
  }

  async update(id: string, data: UpdateExclusionSpecifiqueDto): Promise<ExclusionSpecifique> {
    return super.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return super.delete(id)
  }

  async getByEmploye(id: string): Promise<ExclusionSpecifique[]> {
    return this.api.get(`${this.ressource}/byemploye/${id}`).then(res => res.data)
  }
}

export const ExclusionSpecifiqueService = new ExclusionSpecifiqueServiceClass()
