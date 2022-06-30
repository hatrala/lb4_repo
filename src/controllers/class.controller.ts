import {Constructor, service} from '@loopback/core';
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
  HttpErrors,
} from '@loopback/rest';
import {activedStatus, deletedStatus, draftStatus, teacherType} from '../config';
import {ControllerMixin, ControllerMixinOptions} from '../mixins/controller-mixin';
import {ClassRoom, ClassRoomRelations, User} from '../models';
import {ClassRoomRepository, UserRepository} from '../repositories';
import {NonDbService, ValidateService} from '../services';

const options: ControllerMixinOptions = {
  basePath: 'classRoom',
  modelClass: ClassRoom,
};


export class ClassController extends ControllerMixin<
  ClassRoom,
  Constructor<Object>
>(Object, options) {
  constructor(
    @repository(ClassRoomRepository)
    public mainRepo : ClassRoomRepository,
    @repository(UserRepository)
    public userRepository : UserRepository,

    @service(ValidateService)
    public validateService: ValidateService,
    @service(NonDbService)
    public nonDbService: NonDbService
  ) {
    super();
  }

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
              'modified', 'modifiedByID', "status"
            ],
          }),
        },
      },
    })
    classRoom: Omit<ClassRoom, 'id'>,
  ): Promise<ClassRoom> {

    await this.validateService.checkDuplicateClass(classRoom)
    return this.mainRepo.create(classRoom);

  }

  @del('/class-rooms/Delete/{id}')
  @response(204, {
    description: 'ClassRoom DELETE success',
  })
  async deleteById(
    @param.path.string('id') id: string
    ): Promise<void> {

      await this.userRepository.updateAll({status: draftStatus}, {classRoomId: id})

      await this.mainRepo.updateById(id, {status: deletedStatus});

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
    return this.mainRepo.find();
  }

  @get('/class-rooms/get-class-room-has-more-than{studentNum}')
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
  async getClassRoomByStudentNumGreater(
    @param.path.number("studentNum") studentNum: number
  ): Promise<((ClassRoom & ClassRoomRelations) | undefined)[]> {

    const allClass = await this.mainRepo.find();

    const result = await this.validateService.fillClassHasEnoughStudents(allClass, studentNum)

    return result



}


  @post('/addTeacherToClass/{teacherId}/{classId}')
  async addTeachToClass(
    @param.path.string('teacherId') teacherid: string,
    @param.path.string ('classId') classId: string,
  ): Promise<void> {

    const type = "Teacher"

    await Promise.all([

      this.validateService.verifyUserWhenAddToClass(teacherid, type),

      this.validateService.verifyClassWhenAddUserToClass(classId, type)

    ])

    await Promise.all([

      this.userRepository.updateById(teacherid, {
        classRoomId: classId,
        status: activedStatus
      }),

      this.mainRepo.updateById(classId, {
        status: activedStatus
      })
    ])

    }

  @post('/addStudentToClass/{studentId}/{classId}')
  async addStudentToClass(

  @param.path.string('studentId') studentid: string,
  @param.path.string ('classId') classId: string,

  ): Promise<void> {

    const type = "Student"

    await Promise.all([
      this.validateService.verifyUserWhenAddToClass(studentid, type),
      this.validateService.verifyClassWhenAddUserToClass(classId, type)
    ])

    await this.userRepository.updateById(studentid, {
      classRoomId: classId,
      status: activedStatus
    });

    }

  @get('/class-rooms/count')
  @response(200, {
    description: 'ClassRoom model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(ClassRoom) where?: Where<ClassRoom>,
  ): Promise<Count> {
    return this.mainRepo.count(where);
  }


  @get('/get-Teacher-info-of-class/{classId}')
    @response(200, {
      description: 'List of student in class',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(User, {includeRelations: true}),
          },
        },
      },
    })
    async findTeacherOfClass(

      @param.path.string ('classId') classId: string,

    ): Promise<User | unknown> {



        const foundTeacher = await this.userRepository.findOne({
          where: {
            classRoomId: classId,
            type: teacherType,
            status: activedStatus
          }
        });

        if(!foundTeacher) {
          throw new HttpErrors.NotAcceptable("This class dont have a active teacher or class has been deactive")
        }

        return foundTeacher



    }

    @get('/get-list-of-Student-in-class/{classId}')
    @response(200, {
      description: 'List of student in class',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(User, {includeRelations: true}),
          },
        },
      },
    })
    async findStudentInClass(

      @param.path.string ('classId') classId: string,

    ): Promise<User[]> {

      return this.userRepository.find({
        where: {
          classRoomId: classId,
          type: "Student",
          status: activedStatus
        }
      });

    }

    @get('/student/count-in-class/{classId}')
    @response(200, {
      description: 'User model count',
      content: {'application/json': {schema: CountSchema}},
    })
    async countStudent(
      @param.path.string ('classID') classId: string,
    ): Promise<Count> {

      return this.userRepository.count({
        classRoomId: classId,
        status: activedStatus
      });

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
    return this.mainRepo.findById(id, filter);
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
    await this.mainRepo.updateById(id, classRoom);
  }

  @put('/class-rooms/{id}')
  @response(204, {
    description: 'ClassRoom PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() classRoom: ClassRoom,
  ): Promise<void> {
    await this.mainRepo.replaceById(id, classRoom);
  }


}
