
import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import {User, UserRelations, Group} from '../models';
import {GroupRepository} from './group.repository';

export  class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {

  public readonly group: BelongsToAccessor<Group, typeof User.prototype.id>;

  constructor(
    @inject('datasources.mongoDB') dataSource: MongoDbDataSource, @repository.getter('GroupRepository') protected groupRepositoryGetter: Getter<GroupRepository>,
  ) {
    super(User, dataSource);
    this.group = this.createBelongsToAccessorFor('group', groupRepositoryGetter,);
    this.registerInclusionResolver('group', this.group.inclusionResolver);

  }

}


