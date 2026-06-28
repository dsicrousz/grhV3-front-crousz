import type { ParametreBulletin, CreateParametreBulletinDto, UpdateParametreBulletinDto } from '@/types/parametre-bulletin'
import Api from './Api'
import { Service } from './Service'

class ParametreBulletinServiceClass extends Service {
  constructor() {
    super(Api, 'parametre-bulletin')
  }

  async create(data: CreateParametreBulletinDto): Promise<ParametreBulletin> {
    return super.create(data)
  }

  async getAll(): Promise<ParametreBulletin[]> {
    return super.getAll()
  }

  async getOne(id: string): Promise<ParametreBulletin> {
    return super.getOne(id)
  }

  async getByAnnee(annee: number): Promise<ParametreBulletin> {
    return this.api.get(`/${this.ressource}/annee/${annee}`).then(res => res.data)
  }

  async update(id: string, data: UpdateParametreBulletinDto): Promise<ParametreBulletin> {
    return super.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return super.delete(id)
  }
}

export const ParametreBulletinService = new ParametreBulletinServiceClass()
