import Api from './Api'
import { Service } from './Service'
import type { Categorie, CreateCategorieDto, UpdateCategorieDto } from '@/types/categorie'

class CategorieServiceClass extends Service {
  constructor() {
    super(Api, 'categorie')
  }

  async create(data: CreateCategorieDto): Promise<Categorie> {
    return super.create(data)
  }

  async getAll(): Promise<Categorie[]> {
    return super.getAll()
  }

  async getOne(id: string): Promise<Categorie> {
    return super.getOne(id)
  }

  async update(id: string, data: UpdateCategorieDto): Promise<Categorie> {
    return super.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return super.delete(id)
  }
}

export const CategorieService = new CategorieServiceClass()
