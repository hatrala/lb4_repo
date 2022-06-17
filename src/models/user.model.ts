import { model, property, belongsTo} from '@loopback/repository';
import { BasedModel } from './based.model';
import {ClassRoom} from './class-room.model';

@model({setting: {stict: false}})
export class User extends BasedModel {

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
    default: "Student"
  })
  type: string;

  @belongsTo(() => ClassRoom)
  classRoomId: string;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;



// {settings: {strict: false}}
