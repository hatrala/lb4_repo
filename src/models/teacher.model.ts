import { model, property, hasMany} from '@loopback/repository';
import {User} from './user.model';
import {LessonGroup} from './lesson-group.model';

@model()
export class Teacher extends User {

  @property({
    type: 'number',
    required: false,
  })
  yearOfTeaching: number;

  @hasMany(() => LessonGroup)
  lessonGroups: LessonGroup[];

  constructor(data?: Partial<Teacher>) {
    super(data);
  }
}

export interface TeacherRelations {
  // describe navigational properties here
}

export type TeacherWithRelations = Teacher & TeacherRelations;
