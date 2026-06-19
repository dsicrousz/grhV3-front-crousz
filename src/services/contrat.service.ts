import Api from './Api'
import { Service } from './Service'
import type { Contrat, CreateContratDto, UpdateContratDto, TerminerContratDto } from '@/types/contrat'
import type { TypeContrat, MotifTerminaison } from '@/types/contrat'

class ContratServiceClass extends Service {
  constructor() {
    super(Api, 'contrat')
  }

  async create(data: CreateContratDto): Promise<Contrat> {
    return super.create(data)
  }

  async getAll(): Promise<Contrat[]> {
    return super.getAll()
  }

  async getOne(id: string): Promise<Contrat> {
    return super.getOne(id)
  }

  async getByType(type: TypeContrat): Promise<Contrat[]> {
    return this.api.get(`/${this.ressource}/by-type/${type}`).then(res => res.data)
  }

  async getByEmploye(employeId: string): Promise<Contrat[]> {
    return this.api.get(`/${this.ressource}/by-employe/${employeId}`).then(res => res.data)
  }

  async getActive(employeId: string): Promise<Contrat> {
    return this.api.get(`/${this.ressource}/active/${employeId}`).then(res => res.data)
  }

  async update(id: string, data: UpdateContratDto): Promise<Contrat> {
    return super.update(id, data)
  }

  async terminer(id: string, data: TerminerContratDto): Promise<Contrat> {
    return this.api.patch(`/${this.ressource}/terminer/${id}`, data).then(res => res.data)
  }

  async findTerminaisons(motif?: MotifTerminaison, annee?: number): Promise<Contrat[]> {
    const params = new URLSearchParams()
    if (motif) params.append('motif', motif)
    if (annee) params.append('annee', annee.toString())
    const query = params.toString()
    return this.api.get(`/${this.ressource}/terminations${query ? `?${query}` : ''}`).then(res => res.data)
  }

  async delete(id: string): Promise<void> {
    return super.delete(id)
  }
}

export const ContratService = new ContratServiceClass()
