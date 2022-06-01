import {repository} from '@loopback/repository';
import {
  // patch,
  // put,
  del,
  get,
  getModelSchemaRef,
  param,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {Group, User} from '../models';
import {GroupRepository, UserRepository} from '../repositories';

export class GroupController {
  constructor(
    @repository(GroupRepository)
    public groupRepository: GroupRepository,
    @repository(UserRepository) protected userRepository: UserRepository,
  ) {}

  @post('/create-new-group')
  @response(200, {
    description: 'Group model instance',
    content: {'application/json': {schema: getModelSchemaRef(Group)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Group, {
            title: 'NewGroup',
            exclude: ['id'],
          }),
        },
      },
    })
    group: Group,
  ): Promise<Group> {
    group.id = await this.generateID();
    return this.groupRepository.create(group);
  }

  async generateID(): Promise<number> {
    const count = await this.groupRepository.count();
    return count.count + 1;
  }

  // @get('/groups/count')SSS
  // @response(200, {
  //   description: 'Group model count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async count(
  //   @param.where(Group) where?: Where<Group>,
  // ): Promise<Count> {
  //   return this.groupRepository.count(where);
  // }

  @get('/get-all-group')
  @response(200, {
    description: 'Array of Group model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Group, {
            includeRelations: true,
          }),
        },
      },
    },
  })
  async find(): // @param.filter(Group) filter?: Filter<Group>,
  Promise<Group[]> {
    return this.groupRepository.find();
  }

  @get('/get-user-of-group/{id}')
  @response(200, {
    description: 'Array of Group model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {
            includeRelations: false,
            exclude: ['password'],
          }),
        },
      },
    },
  })
  async findUser(
    @param.path.number('id') id: typeof Group.prototype.id,
  ): Promise<User[]> {
    return this.userRepository.find({
      fields: {password: false},
      where: {groupId: id},
    });
  }
  // @patch('/groups')
  // @response(200, {
  //   description: 'Group PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Group, {partial: true}),
  //       },
  //     },
  //   })
  //   group: Group,
  //   @param.where(Group) where?: Where<Group>,
  // ): Promise<Count> {
  //   return this.groupRepository.updateAll(group, where);
  // }

  // @get('/groups/{id}')
  // @response(200, {
  //   description: 'Group model instance',
  //   content: {
  //     'application/json': {
  //       schema: getModelSchemaRef(Group, {includeRelations: true}),
  //     },
  //   },
  // })
  // async findById(
  //   @param.path.number('id') id: number,
  //   @param.filter(Group, {exclude: 'where'}) filter?: FilterExcludingWhere<Group>
  // ): Promise<Group> {
  //   return this.groupRepository.findById(id, filter);
  // }

  // @patch('/groups/{id}')
  // @response(204, {
  //   description: 'Group PATCH success',
  // })
  // async updateById(
  //   @param.path.number('id') id: number,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Group, {partial: true}),
  //       },
  //     },
  //   })
  //   group: Group,
  // ): Promise<void> {
  //   await this.groupRepository.updateById(id, group);
  // }

  // @put('/groups/{id}')
  // @response(204, {
  //   description: 'Group PUT success',
  // })
  // async replaceById(
  //   @param.path.number('id') id: number,
  //   @requestBody() group: Group,
  // ): Promise<void> {
  //   await this.groupRepository.replaceById(id, group);
  // }

  @del('/groups/{id}')
  @response(204, {
    description: 'Group DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.groupRepository.deleteById(id);
  }
}
