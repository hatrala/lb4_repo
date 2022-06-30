import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository, HasOneRepositoryFactory} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import {RepositoryMixin} from '../mixins/repository-mixin';
import {ClassRoom, ClassRoomRelations, User} from '../models';


export class ClassRoomRepository extends RepositoryMixin<
  ClassRoom,
  Constructor<
    DefaultCrudRepository<ClassRoom, typeof ClassRoom.prototype.id, ClassRoomRelations>
  >
  >(DefaultCrudRepository) {

    public readonly teacher: HasOneRepositoryFactory<User, typeof ClassRoom.prototype.id>;

    constructor(
      @inject('datasources.mongoDB') dataSource: MongoDbDataSource,
    ) {
      super(ClassRoom, dataSource);
  }
}
