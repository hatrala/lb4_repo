import {LessonGroup, LessonGroupRelations, Lesson} from '../models';
import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import {LessonRepository} from './lesson.repository';
import {TeacherRepository} from './teacher.repository';
import {UserRepository} from './user.repository';

export class LessonGroupRepository extends DefaultCrudRepository<
  LessonGroup,
  typeof LessonGroup.prototype.id,
  LessonGroupRelations
> {

  public readonly lesson: BelongsToAccessor<Lesson, typeof LessonGroup.prototype.id>;

  constructor(
    @inject('datasources.mongoDB') dataSource: MongoDbDataSource, @repository.getter('LessonRepository') protected lessonRepositoryGetter: Getter<LessonRepository>, @repository.getter('TeacherRepository') protected teacherRepositoryGetter: Getter<TeacherRepository>, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(LessonGroup, dataSource);
    this.lesson = this.createBelongsToAccessorFor('lesson', lessonRepositoryGetter,);
    this.registerInclusionResolver('lesson', this.lesson.inclusionResolver);
  }
}
