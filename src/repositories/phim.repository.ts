import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import {Phim, PhimRelations} from '../models';

export class PhimRepository extends DefaultCrudRepository<
  Phim,
  typeof Phim.prototype.maPhim,
  PhimRelations
> {
  constructor(
    @inject('datasources.mongoDB') dataSource: MongoDbDataSource,
  ) {
    super(Phim, dataSource);
  }
}
