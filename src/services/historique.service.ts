import Api from './Api'
import { Service } from './Service'
import type { Historique, CreateHistoriqueDto } from '@/types/historique'
import type { TypeEvenement } from '@/types/historique'

class HistoriqueServiceClass extends Service {
  constructor() {
    super(Api, 'historique')
  }

  async create(data: CreateHistoriqueDto): Promise<Historique> {
    return super.create(data)
  }

  async getAll(): Promise<Historique[]> {
    return super.getAll()
  }

  async getOne(id: string): Promise<Historique> {
    return super.getOne(id)
  }

  async getByEmploye(employeId: string): Promise<Historique[]> {
    return this.api.get(`/${this.ressource}/by-employe/${employeId}`).then(res => res.data)
  }

  async getByEmployeAndType(employeId: string, type: TypeEvenement): Promise<Historique[]> {
    return this.api.get(`/${this.ressource}/by-employe/${employeId}/type/${type}`).then(res => res.data)
  }
}

export const HistoriqueService = new HistoriqueServiceClass()
