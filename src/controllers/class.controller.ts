import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {ClassRoom} from '../models';
import {ClassRoomRepository, UserRepository} from '../repositories';
import {ValidateService} from '../services';

export class ClassController {
  constructor(
    @repository(ClassRoomRepository)
    public classRoomRepository : ClassRoomRepository,
    @repository(UserRepository)
    public userRepository : UserRepository,
    @service(ValidateService)
    public validateService: ValidateService
  ) {}

  @post('/create-classroom')
  @response(200, {
    description: 'ClassRoom model instance',
    content: {'application/json': {schema: getModelSchemaRef(ClassRoom)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ClassRoom, {
            title: 'NewClassRoom',
            exclude:
            [
              'id', 'created', 'createdByID',
              'modified', 'modifiedByID', ],
          }),
        },
      },
    })
    classRoom: Omit<ClassRoom, 'id'>,
  ): Promise<ClassRoom> {
    await this.validateService.checkDuplicateClass(classRoom)

    return this.classRoomRepository.create(classRoom);

  }

  @del('/class-rooms/{id}')
  @response(204, {
    description: 'ClassRoom DELETE success',
  })
  async deleteById(
    @param.path.string('id') id: string
    ): Promise<void> {

      await this.userRepository.updateAll({classRoomId: "deleted"}, {classRoomId: id})

      await this.classRoomRepository.deleteById(id);

  }

  @get('/get-all-class-room')
  @response(200, {
    description: 'Array of ClassRoom model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(ClassRoom, {includeRelations: true}),
        },
      },
    },
  })
  async getAllClassRoom(
    // @param.filter(ClassRoom) filter?: Filter<ClassRoom>,
  ): Promise<ClassRoom[]> {
    return this.classRoomRepository.find();
  }


  @get('/class-rooms/count')
  @response(200, {
    description: 'ClassRoom model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(ClassRoom) where?: Where<ClassRoom>,
  ): Promise<Count> {
    return this.classRoomRepository.count(where);
  }


  @patch('/Add-teacher-to-class')
  @response(200, {
    description: 'ClassRoom PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async addTeacherTo(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ClassRoom, {partial: true}),
        },
      },
    })
    classRoom: ClassRoom,
    @param.where(ClassRoom) where?: Where<ClassRoom>,
  ): Promise<Count> {
    return this.classRoomRepository.updateAll(classRoom, where);
  }

  @get('/class-rooms/{id}')
  @response(200, {
    description: 'ClassRoom model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(ClassRoom, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(ClassRoom, {exclude: 'where'}) filter?: FilterExcludingWhere<ClassRoom>
  ): Promise<ClassRoom> {
    return this.classRoomRepository.findById(id, filter);
  }

  @patch('/class-rooms/{id}')
  @response(204, {
    description: 'ClassRoom PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ClassRoom, {partial: true}),
        },
      },
    })
    classRoom: ClassRoom,
  ): Promise<void> {
    await this.classRoomRepository.updateById(id, classRoom);
  }

  @put('/class-rooms/{id}')
  @response(204, {
    description: 'ClassRoom PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() classRoom: ClassRoom,
  ): Promise<void> {
    await this.classRoomRepository.replaceById(id, classRoom);
  }


}
