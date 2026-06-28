import type { MotifRupture, CreateMotifRuptureDto, UpdateMotifRuptureDto } from '@/types/motif-rupture'
import Api from './Api'
import { Service } from './Service'

class MotifRuptureServiceClass extends Service {
  constructor() {
    super(Api, 'motif-rupture')
  }

  async create(data: CreateMotifRuptureDto): Promise<MotifRupture> {
    return super.create(data)
  }

  async getAll(): Promise<MotifRupture[]> {
    return super.getAll()
  }

  async getOne(id: string): Promise<MotifRupture> {
    return super.getOne(id)
  }

  async update(id: string, data: UpdateMotifRuptureDto): Promise<MotifRupture> {
    return super.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return super.delete(id)
  }
}

export const MotifRuptureService = new MotifRuptureServiceClass()
