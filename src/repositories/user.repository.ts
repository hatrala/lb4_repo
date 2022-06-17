
import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import { User, UserRelations, ClassRoom} from '../models';
import {ClassRoomRepository} from './class-room.repository';

export  class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {

  public readonly classRoom: BelongsToAccessor<ClassRoom, typeof User.prototype.id>;

  constructor(
    @inject('datasources.mongoDB') dataSource: MongoDbDataSource, @repository.getter('ClassRoomRepository') protected classRoomRepositoryGetter: Getter<ClassRoomRepository>,
  ) {
    super(User, dataSource);
    this.classRoom = this.createBelongsToAccessorFor('classRoom', classRoomRepositoryGetter,);
    this.registerInclusionResolver('classRoom', this.classRoom.inclusionResolver);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.modelClass as any).observe('persist', async (ctx: any) => {
      ctx.data.modified = new Date();
    });
  }

}


