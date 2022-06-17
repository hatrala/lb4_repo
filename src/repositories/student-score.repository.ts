import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import {StudentScore, StudentScoreRelations} from '../models';

export class StudentScoreRepository extends DefaultCrudRepository<
  StudentScore,
  typeof StudentScore.prototype.id,
  StudentScoreRelations
> {
  constructor(
    @inject('datasources.mongoDB') dataSource: MongoDbDataSource,
  ) {
    super(StudentScore, dataSource);
  }
}
