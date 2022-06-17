import {model, property} from '@loopback/repository';
import {BasedModel} from '../models/based.model';

@model()
export class ClassRoom extends BasedModel {
  @property({
    type: 'string',
    unique: true,
    required: true,
  })
  className: string;


  constructor(data?: Partial<ClassRoom>) {
    super(data);
  }
}

export interface ClassRoomRelations {
  // describe navigational properties here
}

export type ClassRoomWithRelations = ClassRoom & ClassRoomRelations;
