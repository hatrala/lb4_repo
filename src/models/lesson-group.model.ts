
import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Lesson} from './lesson.model';
// import {Teacher} from './teacher.model';


@model()
export class LessonGroup extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  lessonCode: string;

  @property({
    type: 'string',
    required: true,
  })
  groupName: string;

  @belongsTo(() => Lesson)
  lessonId: string;

  @property({
    type: 'string',
  })
  teacherId?: string;

  constructor(data?: Partial<LessonGroup>) {
    super(data);
  }
}

export interface LessonGroupRelations {
  // describe navigational properties here
}

export type LessonGroupWithRelations = LessonGroup & LessonGroupRelations;
