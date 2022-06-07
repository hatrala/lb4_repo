import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import {Major, MajorRelations} from '../models';

export class MajorRepository extends DefaultCrudRepository<
  Major,
  typeof Major.prototype.id,
  MajorRelations
> {
  constructor(
    @inject('datasources.mongoDB') dataSource: MongoDbDataSource,
  ) {
    super(Major, dataSource);
  }
}
