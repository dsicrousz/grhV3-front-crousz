import Api from './Api'
import { Service } from './Service'
import type { Division, Service as ServiceType, CreateDivisionDto, UpdateDivisionDto, CreateServiceDto, UpdateServiceDto, DivisionTree } from '@/types/division'

class DivisionServiceClass extends Service {
  constructor() {
    super(Api, 'division')
  }

  async create(data: CreateDivisionDto): Promise<Division> {
    return super.create(data)
  }

  async getAll(): Promise<Division[]> {
    return super.getAll()
  }

  async getOne(id: string): Promise<Division> {
    return super.getOne(id)
  }

  async update(id: string, data: UpdateDivisionDto): Promise<Division> {
    return super.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return super.delete(id)
  }

  async getTree(): Promise<DivisionTree[]> {
    const divisions = await this.getAll()
    const services = await ServiceService.getAll()
    const buildTree = (parentId: string | null = null): DivisionTree[] => {
      // Pour les racines, on cherche les divisions sans parent ou avec parent vide
      // Pour les enfants, on cherche les divisions avec le bon parent
      const filtered = divisions.filter(d => {
        if (parentId === null) {
          return !d.parent || d.parent === '' || d.parent === null
        } else {
          return d.parent && (typeof d.parent === 'string' ? d.parent === parentId : d.parent._id === parentId)
        }
      })
      // Construire l'arbre récursivement
      return filtered.map(d => ({
        ...d,
        children: buildTree(d._id),
        services: services.filter(s => 
          typeof s.division === 'string' 
            ? s.division === d._id 
            : s.division._id === d._id
        )
      }))
    }

    const result = buildTree()
    return result
  }
}

class ServiceServiceClass extends Service {
  constructor() {
    super(Api, 'service')
  }

  async create(data: CreateServiceDto): Promise<ServiceType> {
    return super.create(data)
  }

  async getAll(): Promise<ServiceType[]> {
    return await super.getAll()
  }

  async getOne(id: string): Promise<ServiceType> {
    return super.getOne(id)
  }

  async update(id: string, data: UpdateServiceDto): Promise<ServiceType> {
    return super.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return super.delete(id)
  }
}

export const DivisionService = new DivisionServiceClass()
export const ServiceService = new ServiceServiceClass()
