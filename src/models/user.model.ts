import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: String;

  @property({
    type: 'string',
    required: true,
    unique: true,
  })
  username: string;

  @property({
    type: 'string',
    required: true,
    unique: true
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'number',
    required: true,
  })
  age: number;

  @property({
    type: 'boolean',
    required: true,
  })
  gender: boolean;

  @property({
    type: 'string',
    required: true,
  })
  major: string;

  @property({
    type: 'string',
    required: true,
  })
  school: string;

  @property({
    type: 'number',
    required: true,
  })
  pocket: number;

  @property({
    type: 'string',
    required: true,
    default: "Student"
  })
  type: string;

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

  @property({
    type: 'string',
  })
  lessonGroupId?: string;


  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
