import {Entity, model, property} from '@loopback/repository';

@model()
export class Group extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
    required: true,
  })
  id: number;

  @property({
    type: 'string',
  })
  groupName?: string;


  constructor(data?: Partial<Group>) {
    super(data);
  }
}

export interface GroupRelations {
  // describe navigational properties here
}

export type GroupWithRelations = Group & GroupRelations;
