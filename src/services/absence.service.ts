import type { Absence, CreateAbsenceDto, UpdateAbsenceDto } from '@/types/absence'
import { StatutDemande } from '@/types/absence'
import Api from './Api'
import { Service } from './Service'

class AbsenceServiceClass extends Service {
  constructor() {
    super(Api, 'absence')
  }

  async create(data: CreateAbsenceDto): Promise<Absence> {
    return super.create(data)
  }

  async getAll(): Promise<Absence[]> {
    return super.getAll()
  }

  async getOne(id: string): Promise<Absence> {
    return super.getOne(id)
  }

  async update(id: string, data: UpdateAbsenceDto): Promise<Absence> {
    return super.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return super.delete(id)
  }

  async getByEmploye(employeId: string): Promise<Absence[]> {
    return this.api.get(`${this.ressource}/employe/${employeId}`).then(res => res.data)
  }

  async validate(id: string, statut: StatutDemande): Promise<Absence> {
    return this.api.patch(`${this.ressource}/${id}/validate`, { statut }).then(res => res.data)
  }
}

export const AbsenceService = new AbsenceServiceClass()
