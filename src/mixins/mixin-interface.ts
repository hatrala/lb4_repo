import { Entity, Model, Where} from '@loopback/repository';

/**
 * An interface to allow finding notes by title
 */
export interface FindByTitle<M extends Model> {
  findByTitle(title: string): Promise<M[]>;
}

export interface Based<M extends Entity> {
  findByFilter(filter: Where<M>): Promise<M[]>;
  updateOne(id: string, updateData: Object): Promise<void>;
  deleteByFilter(filter: Where<M>): Promise<void>;
  createOne(object: M): Promise<M>;
}


