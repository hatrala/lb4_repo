import {model, property} from '@loopback/repository';
import { BasedModel } from './based.model';

@model()
export class Lession extends BasedModel {
  @property({
    type: 'string',
    required: true,
    unique: true
  })
  lessionName: string;

  @property({
    type: 'string',
  })
  lessionDesc?: string;


  constructor(data?: Partial<Lession>) {
    super(data);
  }
}

export interface LessionRelations {
  // describe navigational properties here
}

export type LessionWithRelations = Lession & LessionRelations;
