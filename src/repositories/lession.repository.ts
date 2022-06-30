import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import {RepositoryMixin} from '../mixins/repository-mixin';
import {Lession, LessionRelations} from '../models';

export class LessionRepository extends RepositoryMixin<
Lession,
Constructor<
  DefaultCrudRepository<Lession, typeof Lession.prototype.id, LessionRelations>
>
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.mongoDB') dataSource: MongoDbDataSource,
  ) {
    super(Lession, dataSource);
  }
}
