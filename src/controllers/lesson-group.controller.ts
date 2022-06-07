import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  // Filter,
  // FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  // patch,
  // put,
  // del,
  requestBody,
  response,
  HttpErrors,
  put,
} from '@loopback/rest';
import {LessonGroup} from '../models';
import {LessonGroupRepository, LessonRepository, TeacherRepository, UserRepository} from '../repositories';
import {ValidateService} from '../services';


// export class TeacherToLessonGroup {
//   @property({
//     type: 'string',
//   })
//   teacherUserName: string;

//   @property({
//     type: 'string',
//   })
//   lessonGroupName: string;

//   @property({
//     type: 'string',
//   })
//   lessonCode: string;

// }


export class LessonGroupController {
  constructor(
    @repository(LessonGroupRepository)
    public lessonGroupRepository : LessonGroupRepository,
    @repository(LessonRepository)
    public lessonRepository: LessonRepository,
    @repository(UserRepository)
    protected userRepository: UserRepository,
    @repository(TeacherRepository)
    protected teacherRepository: TeacherRepository,
    @service(ValidateService)
    public validate : ValidateService
  ) {}

  @post('/Create-lesson-group')
  @response(200, {
    description: 'LessonGroup model instance',
    content: {'application/json': {schema: getModelSchemaRef(LessonGroup)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(LessonGroup, {
            title: 'NewLessonGroup',
            exclude: ['id', 'lessonId'],
          }),
        },
      },
    })
    lessonGroup: Omit<LessonGroup, 'id'>,
  ): Promise<LessonGroup> {


    await this.validate.checkExitedLessonByCode(lessonGroup.lessonCode)

    const isDuplicate =  await this.validate.checkDuplicateLessonGroup(lessonGroup.groupName, lessonGroup.lessonCode)

    if(isDuplicate){
      throw new HttpErrors.NotAcceptable(`${lessonGroup.groupName} is already exited in ${lessonGroup.lessonCode}`)
    }

    const foundLesson = await this.lessonRepository.findOne({where: {lessonCode: lessonGroup.lessonCode}})

    lessonGroup.lessonId = foundLesson!.id!

    return this.lessonGroupRepository.create(lessonGroup);
  }

  @get('/lesson-groups/count')
  @response(200, {
    description: 'LessonGroup model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(LessonGroup) where: Where<Omit<LessonGroup, 'id, groupName, lessonId'>>,
  ): Promise<Count> {
    return this.lessonGroupRepository.count(where);
  }

  @get('/get-all-lessonGroup')
  @response(200, {
    description: 'Array of LessonGroup model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(LessonGroup, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    // @param.filter(LessonGroup) filter?: Filter<LessonGroup>,
  ): Promise<LessonGroup[]> {
    return this.lessonGroupRepository.find({include: ['lesson']});
  }


  @put('/add-lessonGroup-to-Teacher/{teacherid}')
  async addTeacherToGroup(
      @param.path.string('teacherid') teacherid: string,
      @requestBody({
        content: {
          'application/json': {
            schema: getModelSchemaRef(LessonGroup, {
              title: 'tempTitle',
              exclude: ['id', 'lessonId', 'teacherId']
            }),
          },
        },
      })
      lessonGroup: Promise<Omit<LessonGroup, "id, lessonId">>
  ): Promise<void> {
    const foundUser = await this.userRepository.findOne({
          where:{
            id: teacherid
           }
          })

          console.log(foundUser);

        if(!(foundUser?.type === "Teacher")) {
          throw new HttpErrors.NotAcceptable(`This User is not a Teacher`)
        }

  }

  // @put('/add-Teacher-to-lessonGroup')
  // async addTeacherToGroup(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(TeacherToLessonGroup, {
  //           title: 'temp tile',
  //         }),
  //       },
  //     },
  //   })
  //   input: Promise<TeacherToLessonGroup>
  // ): Promise<void> {
  //   const foundUser = await this.userRepository.findOne({
  //     where:{
  //       username: (await input).teacherUserName
  //      }
  //     })



  //   // if(!(foundUser?.type === "Teacher")) {
  //   //   throw new HttpErrors.NotAcceptable(`The User with this username: ${(await input).teacherUserName} is not a Teacher`)
  //   // }


  //   await this.validate.checkExitedLessonByCode((await input).lessonCode)

  //   const isExited = await this.validate.checkDuplicateLessonGroup(
  //     (await input).lessonGroupName,
  //     (await input).lessonCode
  //     );

  //   if(!isExited){
  //     throw new HttpErrors.NotAcceptable("LessonGroup is not exited")
  //   }


  //   const foundLessonGroup = await this.lessonGroupRepository.findOne({
  //     where: {
  //       and: [{groupName: (await input).lessonGroupName},
  //             {lessonCode: (await input).lessonCode}]
  //           }
  //         })

  //     // if (foundLessonGroup?.teacher !== undefined) {
  //         foundLessonGroup!.user  = foundUser
  //     // }
  //     console.log(foundLessonGroup);
  //     await this.lessonGroupRepository.replaceById(foundLessonGroup!.id, foundLessonGroup!);


  // }

  // @patch('/lesson-groups')
  // @response(200, {
  //   description: 'LessonGroup PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(LessonGroup, {partial: true}),
  //       },
  //     },
  //   })
  //   lessonGroup: LessonGroup,
  //   @param.where(LessonGroup) where?: Where<LessonGroup>,
  // ): Promise<Count> {
  //   return this.lessonGroupRepository.updateAll(lessonGroup, where);
  // }

  // @get('/lesson-groups/{id}')
  // @response(200, {
  //   description: 'LessonGroup model instance',
  //   content: {
  //     'application/json': {
  //       schema: getModelSchemaRef(LessonGroup, {includeRelations: true}),
  //     },
  //   },
  // })
  // async findById(
  //   @param.path.string('id') id: string,
  //   @param.filter(LessonGroup, {exclude: 'where'}) filter?: FilterExcludingWhere<LessonGroup>
  // ): Promise<LessonGroup> {
  //   return this.lessonGroupRepository.findById(id, filter);
  // }

  // @patch('/lesson-groups/{id}')
  // @response(204, {
  //   description: 'LessonGroup PATCH success',
  // })
  // async updateById(
  //   @param.path.string('id') id: string,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(LessonGroup, {partial: true}),
  //       },
  //     },
  //   })
  //   lessonGroup: LessonGroup,
  // ): Promise<void> {
  //   await this.lessonGroupRepository.updateById(id, lessonGroup);
  // }

  // @put('/lesson-groups/{id}')
  // @response(204, {
  //   description: 'LessonGroup PUT success',
  // })
  // async replaceById(
  //   @param.path.string('id') id: string,
  //   @requestBody() lessonGroup: LessonGroup,
  // ): Promise<void> {
  //   await this.lessonGroupRepository.replaceById(id, lessonGroup);
  // }

  // @del('/lesson-groups/{id}')
  // @response(204, {
  //   description: 'LessonGroup DELETE success',
  // })
  // async deleteById(@param.path.string('id') id: string): Promise<void> {
  //   await this.lessonGroupRepository.deleteById(id);
  // }
}
