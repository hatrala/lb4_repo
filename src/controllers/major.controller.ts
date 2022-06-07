import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  // Filter,

  repository,

} from '@loopback/repository';
import {
  post,
  get,
  getModelSchemaRef,
  // del,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import { Major} from '../models';
import {LessonRepository, MajorRepository} from '../repositories';
import {ValidateService} from '../services';

export class MajorController {
  constructor(
    @repository(MajorRepository)
    public majorRepository : MajorRepository,
    @service(ValidateService) public validate:ValidateService,
    @repository(LessonRepository) public lessonRepository: LessonRepository
  ) {}

  @post('/Create-major')
  @response(200, {
    description: 'Major model instance',
    content: {'application/json': {schema: getModelSchemaRef(Major)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Major, {
            title: 'NewMajor',
            exclude: ['id','created', 'modified'],
          }),
        },
      },
    })
    major: Omit<Major, 'id'>,
  ): Promise<Major> {
    const isDuplicate = await this.validate.checkDuplicateMajor(major.majorName)

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    if(isDuplicate){
      throw new HttpErrors.NotAcceptable("Major was exited")
    }

    return this.majorRepository.create(major);
  }

  @get('/majors/count')
  @response(200, {
    description: 'Major model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    // @param.where(Major) where?: Where<Major>,
  ): Promise<Count> {
    return this.majorRepository.count();
  }

  @get('/ListAllMajor')
  @response(200, {
    description: 'Array of Major model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Major, {includeRelations: true}),
        },
      },
    },
  })
  async find(
  ): Promise<Major[]> {
    return this.majorRepository.find();
  }

  // @patch('/majors')
  // @response(200, {
  //   description: 'Major PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Major, {partial: true}),
  //       },
  //     },
  //   })
  //   major: Major,
  //   @param.where(Major) where?: Where<Major>,
  // ): Promise<Count> {
  //   return this.majorRepository.updateAll(major, where);
  // }

  // @get('/majors/{id}')
  // @response(200, {
  //   description: 'Major model instance',
  //   content: {
  //     'application/json': {
  //       schema: getModelSchemaRef(Major, {includeRelations: true}),
  //     },
  //   },
  // })
  // async findById(
  //   @param.path.string('id') id: string,
  //   @param.filter(Major, {exclude: 'where'}) filter?: FilterExcludingWhere<Major>
  // ): Promise<Major> {
  //   return this.majorRepository.findById(id, filter);
  // }

  // @patch('/majors/{id}')
  // @response(204, {
  //   description: 'Major PATCH success',
  // })
  // async updateById(
  //   @param.path.string('id') id: string,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Major, {
  //           partial: true,
  //           exclude: ['created', 'modified']
  //         }),
  //       },
  //     },
  //   })
  //   major: Major,
  // ): Promise<void> {
  //   await this.majorRepository.updateById(id, major);
  // }

  // @put('/majors/{id}')
  // @response(204, {
  //   description: 'Major PUT success',
  // })
  // async replaceById(
  //   @param.path.string('id') id: string,
  //   @requestBody() major: Major,
  // ): Promise<void> {
  //   await this.majorRepository.replaceById(id, major);
  // }

  // @del('/majors/{id}')
  // @response(204, {
  //   description: 'Major DELETE success',
  // })

  // async deleteById(
  //   @param.path.string('id') id: string): Promise<void> {

  //   await this.lessonRepository.deleteAll()

  //   await this.majorRepository.deleteById(id);
  // }
}
