import type { CreateNominationDto, Nomination, UpdateNominationDto } from '@/types/nomination'
import Api from './Api'
import { Service } from './Service'
class NominationServiceClass extends Service {
  constructor() {
    super(Api, 'nomination')
  }

  async create(data: CreateNominationDto): Promise<Nomination> {
    return super.create(data)
  }

  async getAll(): Promise<Nomination[]> {
    return super.getAll()
  }

  async getOne(id: string): Promise<Nomination> {
    return super.getOne(id)
  }

  async update(id: string, data: UpdateNominationDto): Promise<Nomination> {
    return super.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return super.delete(id)
  }

  async getByEmploye(id: string): Promise<Nomination[]> {
    return this.api.get(`${this.ressource}/byemploye/${id}`).then(res => res.data)
  }
}

export const NominationService = new NominationServiceClass()
