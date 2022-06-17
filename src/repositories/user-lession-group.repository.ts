import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import {UserLessionGroup, UserLessionGroupRelations} from '../models';

export class UserLessionGroupRepository extends DefaultCrudRepository<
  UserLessionGroup,
  typeof UserLessionGroup.prototype.id,
  UserLessionGroupRelations
> {
  constructor(
    @inject('datasources.mongoDB') dataSource: MongoDbDataSource,
  ) {
    super(UserLessionGroup, dataSource);
  }
}
