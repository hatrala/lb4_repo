import {Entity, model, property} from '@loopback/repository';

@model()
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
    default: () => new Date()
  })
  created: Date;

  @property({
    type: 'Date',
    required: true,
    default: () => new Date()
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
    default: "Draft"
  })
  status: "Draft" | "Active" | "Deactive";


  constructor(data?: Partial<BasedModel>) {
    super(data);
  }
}

export interface BasedModelRelations {
  // describe navigational properties here
}

export type BasedModelWithRelations = BasedModel & BasedModelRelations;
