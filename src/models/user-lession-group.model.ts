import {model, property} from '@loopback/repository';
import {BasedModel} from '.';

@model()
export class UserLessionGroup extends BasedModel {
  @property({
    type: 'string',
    required: true,
  })
  userId: string;

  @property({
    type: 'string',
    required: true,
  })
  lessionGroupID: string;


  constructor(data?: Partial<UserLessionGroup>) {
    super(data);
  }
}

export interface UserLessionGroupRelations {
  // describe navigational properties here
}

export type UserLessionGroupWithRelations = UserLessionGroup & UserLessionGroupRelations;
