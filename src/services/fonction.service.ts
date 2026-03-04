import Api from './Api'
import { Service } from './Service'
import type { Fonction, CreateFonctionDto, UpdateFonctionDto } from '@/types/fonction'

class FonctionServiceClass extends Service {
  constructor() {
    super(Api, 'fonction')
  }

  async create(data: CreateFonctionDto): Promise<Fonction> {
    return super.create(data)
  }

  async getAll(): Promise<Fonction[]> {
    return super.getAll()
  }

  async getOne(id: string): Promise<Fonction> {
    return super.getOne(id)
  }

  async update(id: string, data: UpdateFonctionDto): Promise<Fonction> {
    return super.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return super.delete(id)
  }
}

export const FonctionService = new FonctionServiceClass()
