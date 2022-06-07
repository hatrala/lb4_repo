import {Entity, model, property} from '@loopback/repository';

@model()
export class Major extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    unique: true,
    required: true
  })
  majorCode: string;

  @property({
    type: 'string',
    required: true,
    unique: true
  })
  majorName: string;

  @property({
    type: 'string',
    required: true,
  })
  majorDesc: string;

  @property({
    type: 'date',
    default: () => new Date()
  })
  created ? : string;

  @property({
    type: 'date',
    default: () => new Date()
  })
  modified ? : string;




  constructor(data?: Partial<Major>) {
    super(data);
  }
}

export interface MajorRelations {
  // describe navigational properties here
}

export type MajorWithRelations = Major & MajorRelations;
