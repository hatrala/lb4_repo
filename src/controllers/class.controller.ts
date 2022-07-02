import {authenticate} from '@loopback/authentication';
import {Constructor, service} from '@loopback/core';
import {
  Count,
  CountSchema,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {
  activedStatus,
  studentType,
} from '../config';
import {
  ControllerMixin,
  ControllerMixinOptions,
} from '../mixins/controller-mixin';
import {AuditingRepository} from '../mixins/repository-mixin';
import {ClassRoom, User} from '../models';
import {ClassRoomRepository, UserRepository} from '../repositories';
import {NonDbService, ValidateService} from '../services';

const options: ControllerMixinOptions = {
  basePath: 'classRoom',
  modelClass: ClassRoom,
};

export class ClassController extends ControllerMixin<
  ClassRoom,
  Constructor<Object>,
  AuditingRepository<ClassRoom, string>
>(Object, options) {
  constructor(
    @repository(ClassRoomRepository)
    public mainRepo: ClassRoomRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,

    @service(ValidateService)
    public validateService: ValidateService,
    @service(NonDbService)
    public nonDbService: NonDbService,
  ) {
    super();
  }

  @authenticate('jwt')
  @post('/classRoom/create')
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
            exclude: [
              'id',
              'created',
              'createdByID',
              'modified',
              'modifiedByID',
              'status',
            ],
          }),
        },
      },
    })
    classRoom: Omit<ClassRoom, 'id'>,
  ): Promise<ClassRoom> {
    await this.validateService.authorizeTeacher();
    await this.validateService.checkDuplicateClass(classRoom);

    const teacherId = (await this.validateService.headerTokenDecode()).id;
    const teacherInfo = await this.userRepository.findById(teacherId)
    if(teacherInfo.classRoomId) {
      throw new HttpErrors[400]("Teacher already has a class")
    }

    const newclass = await this.mainRepo.create(classRoom);

    await this.userRepository.updateById(teacherId, {
      classRoomId: newclass.id,
    });

    return newclass;
  }

  @authenticate('jwt')
  @post('/addStudentToClass/{studentId}')
  async addStudentToClass(
    @param.path.string('studentId') studentid: string,
  ): Promise<void> {
    await this.validateService.authorizeTeacher();

    const teacher = await this.validateService.headerTokenDecode();
    if(!teacher.classid) {
      throw new HttpErrors[401]
    }

    await Promise.all([
      this.validateService.verifyUserWhenAddToClass(studentid, studentType),
    ]);

    await this.userRepository.updateById(studentid, {
      classRoomId: teacher.classid,
      status: activedStatus,
    });
  }

  @authenticate('jwt')
  @del('/class/deleteStudent/{studentId}')
  async deleteStudentFromClass(
    @param.path.string('studentId') studentid: string,
  ): Promise<void> {
    await this.validateService.authorizeTeacher();
    const student = await this.userRepository.findById(studentid);
    await this.userRepository.replaceById(studentid, student);
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

  @authenticate('jwt')
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
    @param.path.string('classId') classId: string,
  ): Promise<User[]> {
    await this.validateService.authorizeTeacher();

    const teacher = await this.validateService.headerTokenDecode();
    if (teacher.classid !== classId) {
      throw new HttpErrors[403]();
    }

    return this.userRepository.find({
      where: {
        classRoomId: classId,
        type: studentType,
      },
    });
  }

  @authenticate('jwt')
  @get('/student/countStudent')
  @response(200, {
    description: 'User model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async countStudent(
  ): Promise<Count> {
    const teacher = await this.validateService.headerTokenDecode()

    return this.userRepository.count({
      classRoomId: teacher.classid,
      type: studentType
    });
  }

}
