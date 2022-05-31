import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
  HttpErrors,
} from '@loopback/rest';
import {
  User,
  Group,
} from '../models';
import {UserRepository} from '../repositories';

export class UserGroupController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) { }

  @get('/users/{id}/group', {
    responses: {
      '200': {
        description: 'Group belonging to User',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Group)},
          },
        },
      },
    },
  })
  async getGroup(
    @param.path.number('id') id: typeof User.prototype.id,
  ): Promise<Group> {

    if(!await this.userRepository.group(id))
    {

      throw new HttpErrors[404]("This user has not belong to any group")

    }

    return this.userRepository.group(id);
  }
}
