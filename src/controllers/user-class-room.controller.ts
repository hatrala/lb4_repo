import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  User,
  ClassRoom,
} from '../models';
import {UserRepository} from '../repositories';

export class UserClassRoomController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) { }

  @get('/users/{id}/class-room', {
    responses: {
      '200': {
        description: 'ClassRoom belonging to User',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(ClassRoom)},
          },
        },
      },
    },
  })
  async getClassRoom(
    @param.path.string('id') id: typeof User.prototype.id,
  ): Promise<ClassRoom> {
    return this.userRepository.classRoom(id);
  }
}
