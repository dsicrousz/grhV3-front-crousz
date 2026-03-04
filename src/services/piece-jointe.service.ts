import type { PieceJointe, CreatePieceJointeDto, UpdatePieceJointeDto, PieceJointeStats } from '@/types/piece-jointe'
import type { TypePieceJointe } from '@/types/piece-jointe'
import Api from './Api'
import { Service } from './Service'

class PieceJointeServiceClass extends Service {
  constructor() {
    super(Api, 'piece-jointe')
  }

  async upload(data: CreatePieceJointeDto, fichier: File): Promise<PieceJointe> {
    const formData = new FormData()
    formData.append('fichier', fichier)
    formData.append('nom', data.nom)
    formData.append('type', data.type)
    formData.append('employe', data.employe)
    if (data.description) formData.append('description', data.description)
    if (data.date_document) formData.append('date_document', data.date_document)
    if (data.date_expiration) formData.append('date_expiration', data.date_expiration)

    return this.api.post(`/${this.ressource}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data)
  }

  async getAll(): Promise<PieceJointe[]> {
    return super.getAll()
  }

  async getOne(id: string): Promise<PieceJointe> {
    return super.getOne(id)
  }

  async getByEmploye(employeId: string): Promise<PieceJointe[]> {
    return this.api.get(`/${this.ressource}/employe/${employeId}`).then(res => res.data)
  }

  async getByEmployeAndType(employeId: string, type: TypePieceJointe): Promise<PieceJointe[]> {
    return this.api.get(`/${this.ressource}/employe/${employeId}/type/${type}`).then(res => res.data)
  }

  async getStatsByEmploye(employeId: string): Promise<PieceJointeStats> {
    return this.api.get(`/${this.ressource}/employe/${employeId}/stats`).then(res => res.data)
  }

  async getExpiringSoon(days = 30): Promise<PieceJointe[]> {
    return this.api.get(`/${this.ressource}/expiring`, { params: { days } }).then(res => res.data)
  }

  async getExpired(): Promise<PieceJointe[]> {
    return this.api.get(`/${this.ressource}/expired`).then(res => res.data)
  }

  async update(id: string, data: UpdatePieceJointeDto, fichier?: File): Promise<PieceJointe> {
    const formData = new FormData()
    if (fichier) formData.append('fichier', fichier)
    if (data.nom) formData.append('nom', data.nom)
    if (data.type) formData.append('type', data.type)
    if (data.description) formData.append('description', data.description)
    if (data.date_document) formData.append('date_document', data.date_document)
    if (data.date_expiration) formData.append('date_expiration', data.date_expiration)

    return this.api.patch(`/${this.ressource}/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data)
  }

  async softDelete(id: string): Promise<void> {
    return this.api.delete(`/${this.ressource}/${id}`).then(res => res.data)
  }

  async hardDelete(id: string): Promise<void> {
    return this.api.delete(`/${this.ressource}/${id}/permanent`).then(res => res.data)
  }
}

export const PieceJointeService = new PieceJointeServiceClass()
