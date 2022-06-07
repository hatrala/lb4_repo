import {model, property} from '@loopback/repository';
import {User} from './user.model';

@model()
export class Student extends User {
  @property({
    type: 'number',
    required: false,
    default: 0
  })
  GPA: number;

  constructor(data?: Partial<Student>) {
    super(data);
  }
}

export interface StudentRelations {
  // describe navigational properties here
}

export type StudentWithRelations = Student & StudentRelations;
