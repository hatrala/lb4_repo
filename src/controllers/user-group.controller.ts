import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, HttpErrors, param} from '@loopback/rest';
import {Group, User} from '../models';
import {UserRepository} from '../repositories';

export class UserGroupController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  @get('/get-groupInfor-by-userId/{userId}', {
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
    @param.path.number('userId') id: typeof User.prototype.id,
  ): Promise<Group> {
    const userGroup = await this.userRepository.group(id);

    if (!userGroup) {
      throw new HttpErrors[404]('This user has not belong to any group');
    }

    return userGroup;
  }
}
