import {inject} from '@loopback/core';
import {HasOneRepositoryFactory} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import {AuditingRepository} from '../mixins/repository-mixin';
import {ClassRoom, ClassRoomRelations, User} from '../models';


export class ClassRoomRepository extends AuditingRepository<
  ClassRoom,
  typeof ClassRoom.prototype.id,
  ClassRoomRelations
> {

    public readonly teacher: HasOneRepositoryFactory<User, typeof ClassRoom.prototype.id>;

    constructor(
      @inject('datasources.mongoDB') dataSource: MongoDbDataSource,
    ) {
      super(ClassRoom, dataSource);
  }
}
