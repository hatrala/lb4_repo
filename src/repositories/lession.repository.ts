import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import {Lession, LessionRelations} from '../models';

export class LessionRepository extends DefaultCrudRepository<
  Lession,
  typeof Lession.prototype.id,
  LessionRelations
> {
  constructor(
    @inject('datasources.mongoDB') dataSource: MongoDbDataSource,
  ) {
    super(Lession, dataSource);
  }
}
