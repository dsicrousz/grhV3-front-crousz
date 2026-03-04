import Api from './Api';
import { Service } from './Service';
import type { Rubrique, CreateRubriqueDto, UpdateRubriqueDto } from '@/types/rubrique';

class RubriqueServiceClass extends Service {
  constructor() {
    super(Api, 'rubrique');
  }

  async create(data: CreateRubriqueDto): Promise<Rubrique> {
    return super.create(data);
  }

  async getAll(): Promise<Rubrique[]> {
    return super.getAll();
  }

  async getOne(id: string): Promise<Rubrique> {
    return super.getOne(id);
  }

  async update(id: string, data: UpdateRubriqueDto): Promise<Rubrique> {
    return super.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return super.delete(id);
  }
}

export const RubriqueService = new RubriqueServiceClass();
