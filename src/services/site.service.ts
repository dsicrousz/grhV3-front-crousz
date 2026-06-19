import Api from './Api'
import { Service } from './Service'
import type { Site, CreateSiteDto, UpdateSiteDto } from '@/types/site'

class SiteServiceClass extends Service {
  constructor() {
    super(Api, 'site')
  }

  async create(data: CreateSiteDto): Promise<Site> {
    return super.create(data)
  }

  async getAll(): Promise<Site[]> {
    return super.getAll()
  }

  async getOne(id: string): Promise<Site> {
    return super.getOne(id)
  }

  async update(id: string, data: UpdateSiteDto): Promise<Site> {
    return super.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return super.delete(id)
  }
}

export const SiteService = new SiteServiceClass()
