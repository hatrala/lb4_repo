import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Major} from './major.model';

@model()
export class Lesson extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
    unique: true
  })
  lessonCode?: string;

  @property({
    type: 'string',
    required: true,
    unique: true
  })
  lessonName: string;

  @property({
    type: 'string',
    required: true,
  })
  lessonDesc: string;

  @property({
    type: 'string',
    required: true
  })
  majorCode: string;

  @property({
    type: 'date',
    default: () => new Date()
  })
  created?: string;

  @property({
    type: 'date',
    default: () => new Date()
  })
  modified?: string;

  @belongsTo(() => Major)
  majorId: string;

  constructor(data?: Partial<Lesson>) {
    super(data);
  }
}

export interface LessonRelations {
  // describe navigational properties here
}

export type LessonWithRelations = Lesson & LessonRelations;
