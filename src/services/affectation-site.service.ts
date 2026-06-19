import Api from './Api'
import { Service } from './Service'
import type { AffectationSite, CreateAffectationSiteDto, UpdateAffectationSiteDto } from '@/types/affectation-site'

class AffectationSiteServiceClass extends Service {
  constructor() {
    super(Api, 'affectation-site')
  }

  async create(data: CreateAffectationSiteDto): Promise<AffectationSite> {
    return super.create(data)
  }

  async getAll(): Promise<AffectationSite[]> {
    return super.getAll()
  }

  async getByEmploye(employeId: string): Promise<AffectationSite[]> {
    return this.api.get(`/${this.ressource}/by-employe/${employeId}`).then(res => res.data)
  }

  async getActive(employeId: string): Promise<AffectationSite> {
    return this.api.get(`/${this.ressource}/active/${employeId}`).then(res => res.data)
  }

  async getBySite(siteId: string): Promise<AffectationSite[]> {
    return this.api.get(`/${this.ressource}/by-site/${siteId}`).then(res => res.data)
  }

  async getByDivision(divisionId: string): Promise<AffectationSite[]> {
    return this.api.get(`/${this.ressource}/by-division/${divisionId}`).then(res => res.data)
  }

  async getByService(serviceId: string): Promise<AffectationSite[]> {
    return this.api.get(`/${this.ressource}/by-service/${serviceId}`).then(res => res.data)
  }

  async countByDivision(): Promise<{ _id: string; nom: string; count: number }[]> {
    return this.api.get(`/${this.ressource}/stats/by-division`).then(res => res.data)
  }

  async countByService(): Promise<{ _id: string; nom: string; count: number }[]> {
    return this.api.get(`/${this.ressource}/stats/by-service`).then(res => res.data)
  }

  async update(id: string, data: UpdateAffectationSiteDto): Promise<AffectationSite> {
    return super.update(id, data)
  }

  async terminer(id: string): Promise<AffectationSite> {
    return this.api.patch(`/${this.ressource}/terminer/${id}`).then(res => res.data)
  }

  async delete(id: string): Promise<void> {
    return super.delete(id)
  }
}

export const AffectationSiteService = new AffectationSiteServiceClass()
