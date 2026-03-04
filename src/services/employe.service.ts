import Api from './Api'
import { Service } from './Service'
import type { Employe, CreateEmployeDto, UpdateEmployeDto } from '@/types/employe'

class EmployeServiceClass extends Service {
  constructor() {
    super(Api, 'employe')
  }

  async create(data: CreateEmployeDto): Promise<Employe> {
    return super.create(data)
  }

  async getAll(): Promise<Employe[]> {
    return super.getAll()
  }

  async getOne(id: string): Promise<Employe> {
    return super.getOne(id)
  }

  async update(id: string, data: UpdateEmployeDto): Promise<Employe> {
    return super.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return super.delete(id)
  }

  async toggle(id: string, data: UpdateEmployeDto): Promise<Employe> {
    return this.api.patch(`${this.ressource}/toggle/${id}`, data)
  }
}

export const EmployeService = new EmployeServiceClass()
