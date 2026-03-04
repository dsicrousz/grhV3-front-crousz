import Api from './Api'
import { Service } from './Service'
import type { AttributionIndividuelle, CreateAttributionIndividuelleDto, UpdateAttributionIndividuelleDto } from '@/types/attribution-individuelle'

class AttributionIndividuelleServiceClass extends Service {
  constructor() {
    super(Api, 'attribution-individuelle')
  }

  async create(data: CreateAttributionIndividuelleDto): Promise<AttributionIndividuelle> {
    return super.create(data)
  }

  async getAll(): Promise<AttributionIndividuelle[]> {
    return super.getAll()
  }

  async update(id: string, data: UpdateAttributionIndividuelleDto): Promise<AttributionIndividuelle> {
    return super.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return super.delete(id)
  }

  async getByEmploye(id: string): Promise<AttributionIndividuelle[]> {
    return this.api.get(`${this.ressource}/byemploye/${id}`).then(res => res.data)
  }
}

export const AttributionIndividuelleService = new AttributionIndividuelleServiceClass()
