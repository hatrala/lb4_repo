import {inject} from '@loopback/core';
import {DefaultCrudRepository, HasOneRepositoryFactory} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import {ClassRoom, ClassRoomRelations, User} from '../models';


export class ClassRoomRepository extends DefaultCrudRepository<
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
