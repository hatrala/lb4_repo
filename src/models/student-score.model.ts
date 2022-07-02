import {model, property} from '@loopback/repository';
import {BasedModel} from '.';

@model()
export class StudentScore extends BasedModel {
  @property({
    type: 'string',
    required: true,
  })
  studentId: string;

  @property({
    type: 'string',
    required: true,
  })
  lessionId: string;

  @property({
    type: 'number',
    required: true,
    default: 0,
  })
  score: number;

  constructor(data?: Partial<StudentScore>) {
    super(data);
  }
}

export interface StudentScoreRelations {
  // describe navigational properties here
}

export type StudentScoreWithRelations = StudentScore & StudentScoreRelations;
