import type { Bulletin} from '@/types/bulletin'
import Api from './Api'
import { Service } from './Service'

class BulletinServiceClass extends Service {
  constructor() {
    super(Api, 'bulletin')
  }

  async getOne(id: string): Promise<Bulletin> {
    return super.getOne(id)
  }

  async getByEmploye(employeId: string): Promise<Bulletin[]> {
    return this.api.get(`${this.ressource}/employe/${employeId}`).then(res => res.data)
  }

  async getByLot(lotId: string): Promise<Bulletin[]> {
    return this.api.get(`${this.ressource}/lot/${lotId}`).then(res => res.data)
  }
}

export const BulletinService = new BulletinServiceClass()
