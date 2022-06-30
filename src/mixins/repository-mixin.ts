import {MixinTarget} from '@loopback/core';
import { Where, Entity, DefaultCrudRepository} from '@loopback/repository';
import {Based} from './mixin-interface';

/*
 * This function adds a new method 'findByTitle' to a repository class
 * where 'M' is a model which extends Model
 *
 * @param superClass - Base class
 *
 * @typeParam M - Model class which extends Model
 * @typeParam R - Repository class
 */

export function RepositoryMixin<
  M extends Entity,
  R extends MixinTarget<DefaultCrudRepository<M, string>>,
>(superClass: R) {
  class MixedRepository extends superClass implements Based<M> {
    async createOne(object: M): Promise<M> {
      return this.create(object)
    }
    async deleteByFilter(filter: Where<M>): Promise<void> {
      await this.deleteAll(filter);
    }
    async updateOne(id: string, updateData: Object ): Promise<void> {
      await this.updateById(id, updateData);
    }
    async findByFilter(filter: Where<M>): Promise<M[]> {
      return this.find({where: filter});
    }
  }
  return MixedRepository;
}
