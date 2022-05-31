import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Group} from './group.model';

@model()
export class User extends Entity {
  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'number',
    id: true,
    generated: false,
    required: false,
    default: 0,
    forceid: false
  })
  id: number;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @belongsTo(() => Group)
  groupId: number;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
