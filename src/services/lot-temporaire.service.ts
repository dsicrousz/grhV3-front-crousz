import Api from './Api'
import { Service } from './Service'
import type { Lot, CreateLotDto, UpdateLotDto } from '@/types/lot'

class LotTemporaireServiceClass extends Service {
  constructor() {
    super(Api, 'lot-temporaire')
  }

  async create(data: CreateLotDto): Promise<Lot> {
    return super.create(data)
  }

  async getAll(): Promise<Lot[]> {
    return super.getAll()
  }

  async getOne(id: string): Promise<Lot> {
    return super.getOne(id)
  }

  async update(id: string, data: UpdateLotDto): Promise<Lot> {
    return super.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return super.delete(id)
  }

  async publish(id: string): Promise<Lot> {
    return this.api.patch(`${this.ressource}/${id}/publish`).then(res => res.data)
  }

  async generate(id: string, postes?: string[]): Promise<Lot> {
    return this.api.post(`${this.ressource}/generate/${id}`, { postes: postes || [] }).then(res => res.data)
  }

  async submit(id: string): Promise<Lot> {
    return this.api.patch(`${this.ressource}/submit/${id}`).then(res => res.data)
  }

  async cancelSubmit(id: string): Promise<Lot> {
    return this.api.patch(`${this.ressource}/cancel-submit/${id}`).then(res => res.data)
  }

  async setWaiting(id: string): Promise<Lot> {
    return this.api.patch(`${this.ressource}/set-waiting/${id}`).then(res => res.data)
  }

  async cancelWaiting(id: string): Promise<Lot> {
    return this.api.patch(`${this.ressource}/cancel-waiting/${id}`).then(res => res.data)
  }

  async validate(id: string): Promise<Lot> {
    return this.api.patch(`${this.ressource}/validate/${id}`).then(res => res.data)
  }

  async reject(id: string): Promise<Lot> {
    return this.api.patch(`${this.ressource}/reject/${id}`).then(res => res.data)
  }

  async unpublish(id: string): Promise<Lot> {
    return this.api.patch(`${this.ressource}/${id}/unpublish`).then(res => res.data)
  }

  async transmit(id: string): Promise<Lot> {
    return this.api.patch(`${this.ressource}/transmit/${id}`).then(res => res.data)
  }

  async untransmit(id: string): Promise<Lot> {
    return this.api.patch(`${this.ressource}/untransmit/${id}`).then(res => res.data)
  }
}

export const LotTemporaireService = new LotTemporaireServiceClass()
