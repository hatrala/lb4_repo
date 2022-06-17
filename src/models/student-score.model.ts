import {model, property} from '@loopback/repository';
import {BasedModel} from '.';

@model()
export class StudentScore extends BasedModel {
  @property({
    type: 'string',
    required: true,
  })
  studentID: string;

  @property({
    type: 'string',
    required: true,
  })
  lessionID: string;

  @property({
    type: 'number',
    default: 0
  })
  score?: number;


  constructor(data?: Partial<StudentScore>) {
    super(data);
  }
}

export interface StudentScoreRelations {
  // describe navigational properties here
}

export type StudentScoreWithRelations = StudentScore & StudentScoreRelations;
