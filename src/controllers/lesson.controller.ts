import {service} from '@loopback/core';
import {
  // Count,
  // CountSchema,
  // Filter,
  // FilterExcludingWhere,
  repository,
  // Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  // patch,
  put,
  del,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
// import {get} from 'http';
import {Lesson} from '../models';
import {LessonRepository, MajorRepository} from '../repositories';
import {ValidateService} from '../services';

export class LessonController {
  constructor(
    @repository(LessonRepository)
    public lessonRepository : LessonRepository,
    @service(ValidateService) public validate:ValidateService,
    @repository(MajorRepository) protected majorRepository: MajorRepository
  ) {}

  @post('/Create-lesson')
  @response(200, {
    description: 'Lesson model instance',
    content: {'application/json': {schema: getModelSchemaRef(Lesson)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Lesson, {
            title: 'NewLesson',
            exclude: ['id', 'created', 'modified', 'majorId'],
          }),
        },
      },
    })
    lesson: Omit<Lesson, 'id'>,
  ): Promise<Lesson> {

    await this.validate.checkDuplicateLesson(lesson)

    const foundMajor = await this.majorRepository.findOne({where: {majorCode: lesson.majorCode}})

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    if(!foundMajor) {
      throw new HttpErrors.NotAcceptable("Major not exited")
    }

    lesson.majorId = foundMajor.id!

    return this.lessonRepository.create(lesson);
  }

  @get('/get-all-lesson-of-major/{majorCode}')
  @response(200, {
      description: 'Array of Lesson model instances',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(Lesson, {includeRelations: true}),
          },
        },
      },
    })
    async find(
      @param.path.string('majorCode') majorCode: string,
    ): Promise<Lesson[]> {

      const lessonList = await this.lessonRepository.find({where: {majorCode: majorCode}});

      if(lessonList.length === 0){
        throw new HttpErrors.NotAcceptable(`Major not exited or does not have any lesson`)
      }

      return lessonList

    }

    @get('/get-all-lesson')
    @response(200, {
      description: 'Array of Lesson model instances',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(Lesson, {includeRelations: true}),
          },
        },
      },
    })
    async findAll(
    ): Promise<unknown> {

      const lessonList = await this.lessonRepository.find({include: ['major']});

      return lessonList

    }


  @put('/AddLessontoMajor/{lessonID}')
  @response(204, {
    description: 'Lesson PUT success',
  })
  async addClassToMajor(
    @param.path.string('lessonID') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Lesson, {
            title: 'AddClassToMajor',
            exclude: ['id','lessonName', 'created', 'lessonDesc', 'modified' ],
          }),
        },
      },
  }) lesson: Lesson,
  ): Promise<void> {
    await this.lessonRepository.updateById(id, lesson);
  }



  @del('/lesson/{id}')
  @response(204, {
    description: 'Lesson DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.lessonRepository.deleteById(id);
  }

  // @get('/class-rooms/count')
  // @response(200, {
  //   description: 'ClassRoom model count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async count(
  //   @param.where(ClassRoom) where?: Where<ClassRoom>,
  // ): Promise<Count> {
  //   return this.classRoomRepository.count(where);
  // }

  // @get('/class-rooms')
  // @response(200, {
  //   description: 'Array of ClassRoom model instances',
  //   content: {
  //     'application/json': {
  //       schema: {
  //         type: 'array',
  //         items: getModelSchemaRef(ClassRoom, {includeRelations: true}),
  //       },
  //     },
  //   },
  // })
  // async find(
  //   @param.filter(ClassRoom) filter?: Filter<ClassRoom>,
  // ): Promise<ClassRoom[]> {
  //   return this.classRoomRepository.find(filter);
  // }

  // @patch('/class-rooms')
  // @response(200, {
  //   description: 'ClassRoom PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(ClassRoom, {partial: true}),
  //       },
  //     },
  //   })
  //   classRoom: ClassRoom,
  //   @param.where(ClassRoom) where?: Where<ClassRoom>,
  // ): Promise<Count> {
  //   return this.classRoomRepository.updateAll(classRoom, where);
  // }

  // @get('/class-rooms/{id}')
  // @response(200, {
  //   description: 'ClassRoom model instance',
  //   content: {
  //     'application/json': {
  //       schema: getModelSchemaRef(ClassRoom, {includeRelations: true}),
  //     },
  //   },
  // })
  // async findById(
  //   @param.path.string('id') id: string,
  //   @param.filter(ClassRoom, {exclude: 'where'}) filter?: FilterExcludingWhere<ClassRoom>
  // ): Promise<ClassRoom> {
  //   return this.classRoomRepository.findById(id, filter);
  // }

  // @patch('/class-rooms/{id}')
  // @response(204, {
  //   description: 'ClassRoom PATCH success',
  // })
  // async updateById(
  //   @param.path.string('id') id: string,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(ClassRoom, {partial: true}),
  //       },
  //     },
  //   })
  //   classRoom: ClassRoom,
  // ): Promise<void> {
  //   await this.classRoomRepository.updateById(id, classRoom);
  // }


}
