import {Entity, model, property} from '@loopback/repository';

// enum Status {
//   deleted = "deteled",
//   activated = "activated",
//   draft = "draft"
// }

@model({
  setting: {strict: false},
  indexes: {
    username: {
      keys: {
        username: 1,
        11111: 1,
      },
      options: {unique: true},
    },
  },
})
export class BasedModel extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'Date',
    required: true,
    default: () => new Date(),
  })
  created: Date;

  @property({
    type: 'Date',
    required: true,
    default: () => new Date(),
  })
  modified: Date;

  @property({
    type: 'string',
  })
  createdByID?: string;

  @property({
    type: 'string',
  })
  modifiedByID?: string;

  @property({
    type: 'string',
    default: 'draft',
  })
  status: 'draft' | 'actived' | 'deleted';

  constructor(data?: Partial<BasedModel>) {
    super(data);
  }
}

export interface BasedModelRelations {
  // describe navigational properties here
}

export type BasedModelWithRelations = BasedModel & BasedModelRelations;
