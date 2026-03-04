import Api from './Api'
import { Service } from './Service'
import type { 
  AttributionFonctionnelle, 
  CreateAttributionFonctionnelleDto, 
  UpdateAttributionFonctionnelleDto,
  AttributionGlobale,
  CreateAttributionGlobaleDto,
  UpdateAttributionGlobaleDto
} from '@/types/attribution'

class AttributionFonctionnelleServiceClass extends Service {
  constructor() {
    super(Api, 'attribution-fonctionnelle')
  }

  async create(data: CreateAttributionFonctionnelleDto): Promise<AttributionFonctionnelle> {
    return super.create(data)
  }

  async getAll(): Promise<AttributionFonctionnelle[]> {
    return super.getAll()
  }

  async getOne(id: string): Promise<AttributionFonctionnelle> {
    return super.getOne(id)
  }

  async update(id: string, data: UpdateAttributionFonctionnelleDto): Promise<AttributionFonctionnelle> {
    return super.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return super.delete(id)
  }
}

class AttributionGlobaleServiceClass extends Service {
  constructor() {
    super(Api, 'attribution-globale')
  }

  async create(data: CreateAttributionGlobaleDto): Promise<AttributionGlobale> {
    return super.create(data)
  }

  async getAll(): Promise<AttributionGlobale[]> {
    return super.getAll()
  }

  async getOne(id: string): Promise<AttributionGlobale> {
    return super.getOne(id)
  }

  async update(id: string, data: UpdateAttributionGlobaleDto): Promise<AttributionGlobale> {
    return super.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return super.delete(id)
  }
}

export const AttributionFonctionnelleService = new AttributionFonctionnelleServiceClass()
export const AttributionGlobaleService = new AttributionGlobaleServiceClass()
