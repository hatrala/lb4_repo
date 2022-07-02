import {inject} from '@loopback/core';
import {MongoDbDataSource} from '../datasources';
import {AuditingRepository} from '../mixins/repository-mixin';
import {Lession, LessionRelations} from '../models';

export class LessionRepository extends AuditingRepository<
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
