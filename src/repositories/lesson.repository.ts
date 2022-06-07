import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import {Lesson, LessonRelations, Major} from '../models';

import {MajorRepository} from './major.repository';

// import {MajorRepository} from './major.repository';

export class LessonRepository extends DefaultCrudRepository<
  Lesson,
  typeof Lesson.prototype.id,
  LessonRelations
> {

  public readonly major: BelongsToAccessor<Major, typeof Lesson.prototype.id>;
  // public readonly major: BelongsToAccessor<Major, typeof Lesson.prototype.id>;

  constructor(
    @inject('datasources.mongoDB') dataSource: MongoDbDataSource, @repository.getter('MajorRepository') protected majorRepositoryGetter: Getter<MajorRepository>,
    // @repository.getter('MajorRepository') protected majorRepositoryGetter: Getter<MajorRepository>,
  ) {
    super(Lesson, dataSource);
    this.major = this.createBelongsToAccessorFor('major', majorRepositoryGetter,);
    this.registerInclusionResolver('major', this.major.inclusionResolver);
    // this.major = this.createBelongsToAccessorFor('major', majorRepositoryGetter,);
    // this.registerInclusionResolver('major', this.major.inclusionResolver);
  }
}


