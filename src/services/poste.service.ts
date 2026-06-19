import Api from './Api'
import { Service } from './Service'
import type { Poste, CreatePosteDto, UpdatePosteDto } from '@/types/poste'

class PosteServiceClass extends Service {
  constructor() {
    super(Api, 'poste')
  }

  async create(data: CreatePosteDto): Promise<Poste> {
    return super.create(data)
  }

  async getAll(): Promise<Poste[]> {
    return super.getAll()
  }

  async getOne(id: string): Promise<Poste> {
    return super.getOne(id)
  }

  async update(id: string, data: UpdatePosteDto): Promise<Poste> {
    return super.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return super.delete(id)
  }
}

export const PosteService = new PosteServiceClass()
