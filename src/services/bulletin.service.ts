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

  async getByEmployeCdd(employeId: string): Promise<Bulletin[]> {
    return this.api.get(`bulletin-cdd/employe/${employeId}`).then(res => res.data)
  }

  async getByLotCdd(lotId: string): Promise<Bulletin[]> {
    return this.api.get(`bulletin-cdd/lot/${lotId}`).then(res => res.data)
  }

  async getByEmployeTemporaire(employeId: string): Promise<Bulletin[]> {
    return this.api.get(`bulletin-temporaire/employe/${employeId}`).then(res => res.data)
  }

  async getByLotTemporaire(lotId: string): Promise<Bulletin[]> {
    return this.api.get(`bulletin-temporaire/lot/${lotId}`).then(res => res.data)
  }
}

export const BulletinService = new BulletinServiceClass()
