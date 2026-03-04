import type { Conge, CreateCongeDto, UpdateCongeDto, ValidateCongeDto, SoldeConges, CongeStats } from '@/types/conge'
import { StatutDemandeConge } from '@/types/conge'
import Api from './Api'
import { Service } from './Service'

class CongeServiceClass extends Service {
  constructor() {
    super(Api, 'conge')
  }

  async create(data: CreateCongeDto): Promise<Conge> {
    return super.create(data)
  }

  async getAll(): Promise<Conge[]> {
    return super.getAll()
  }

  async getOne(id: string): Promise<Conge> {
    return super.getOne(id)
  }

  async update(id: string, data: UpdateCongeDto): Promise<Conge> {
    return super.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return super.delete(id)
  }

  async getByEmploye(employeId: string): Promise<Conge[]> {
    return this.api.get(`${this.ressource}/employe/${employeId}`).then(res => res.data)
  }

  async getPending(): Promise<Conge[]> {
    return this.api.get(`${this.ressource}/pending`).then(res => res.data)
  }

  async getByStatut(statut: StatutDemandeConge): Promise<Conge[]> {
    return this.api.get(`${this.ressource}/statut/${statut}`).then(res => res.data)
  }

  async getStatsByEmploye(employeId: string): Promise<CongeStats> {
    return this.api.get(`${this.ressource}/employe/${employeId}/stats`).then(res => res.data)
  }

  async getSoldeConges(employeId: string, annee?: number, quota?: number): Promise<SoldeConges> {
    const params = new URLSearchParams()
    if (annee) params.append('annee', annee.toString())
    if (quota) params.append('quota', quota.toString())
    const queryString = params.toString()
    return this.api.get(`${this.ressource}/employe/${employeId}/solde${queryString ? `?${queryString}` : ''}`).then(res => res.data)
  }

  async getByEmployeAndPeriod(employeId: string, dateDebut: string, dateFin: string): Promise<Conge[]> {
    return this.api.get(`${this.ressource}/employe/${employeId}/period?dateDebut=${dateDebut}&dateFin=${dateFin}`).then(res => res.data)
  }

  async validate(id: string, data: ValidateCongeDto): Promise<Conge> {
    return this.api.patch(`${this.ressource}/${id}/validate`, data).then(res => res.data)
  }
}

export const CongeService = new CongeServiceClass()
