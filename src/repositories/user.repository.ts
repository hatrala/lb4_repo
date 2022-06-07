
import {inject} from '@loopback/core';
import {DefaultCrudRepository,} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import { User, UserRelations, } from '../models';


export  class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {


  constructor(
    @inject('datasources.mongoDB') dataSource: MongoDbDataSource,
  ) {
    super(User, dataSource);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.modelClass as any).observe('persist', async (ctx: any) => {
      ctx.data.modified = new Date();
    });
  }

}


