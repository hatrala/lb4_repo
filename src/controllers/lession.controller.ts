import {authenticate} from '@loopback/authentication';
import {Constructor, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {activedStatus, studentType} from '../config';
import {
  ControllerMixin,
  ControllerMixinOptions,
} from '../mixins/controller-mixin';
import {AuditingRepository} from '../mixins/repository-mixin';
import {Lession, StudentScore, User} from '../models';
import {
  LessionRepository,
  StudentScoreRepository,
  UserRepository,
} from '../repositories';
import {ValidateService} from '../services';
import {UserService} from '../services/user.service';

const options: ControllerMixinOptions = {
  basePath: 'lession',
  modelClass: Lession,
};

export class LessionController extends ControllerMixin<
  Lession,
  Constructor<Object>,
  AuditingRepository<Lession, string>
>(Object, options) {
  constructor(
    @repository(LessionRepository)
    public mainRepo: LessionRepository,
    @repository(StudentScoreRepository)
    public studentScoreRepo: StudentScoreRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,

    @service(ValidateService)
    public validservice: ValidateService,
    @service(UserService)
    public userService: UserService,
  ) {
    super();
  }

  @authenticate('jwt')
  @patch('/lession/EditScore/{id}')
  async edditScore(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(StudentScore, {
            title: 'abc',
            exclude: [
              'id',
              'created',
              'createdByID',
              'modified',
              'modifiedByID',
              'status',
              'lessionId',
              'studentId',
            ],
          }),
        },
      },
    })
    newScore: StudentScore,
  ): Promise<void> {
    await this.validservice.authorizeWhenUpdateScore(id);

    try {
      await this.studentScoreRepo.updateById(id, newScore);
    } catch (error) {
      throw new HttpErrors[400](error);
    }
  }

  @authenticate('jwt')
  @get('/lession/viewStudentScore/{studentId}')
  @response(200, {
    description: 'List of score of student',
    content: {
      'application/json': {
        schema: {
          type: 'array',
        },
      },
    },
  })
  async getStudentScore(
    @param.path.string('studentId') studentId: string,
  ): Promise<Array<Object>> {
    await this.validservice.authorizeWhenGetScore(studentId);

    const studentScore = await this.userService.getStudentScore(studentId);
    return studentScore;
  }

  @authenticate('jwt')
  @post('/lession/create')
  @response(200, {
    description: 'Lession model instance',
    content: {'application/json': {schema: getModelSchemaRef(Lession)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Lession, {
            title: 'NewLession',
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
    lession: Omit<Lession, 'id'>,
  ): Promise<Lession> {
    await this.validservice.authorizeTeacher();
    await this.validservice.checkDuplicateLession(lession);

    return this.mainRepo.create(lession);
  }

  @authenticate('jwt')
  @post('/lession/addStudentToLession')
  @response(200, {
    description: 'studentScore model instance',
    content: {'application/json': {schema: getModelSchemaRef(StudentScore)}},
  })
  async createStudentScore(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(StudentScore, {
            title: 'score',
            exclude: [
              'id',
              'created',
              'createdByID',
              'modified',
              'modifiedByID',
              'status',
              'score',
            ],
          }),
        },
      },
    })
    studentScore: StudentScore,
  ): Promise<StudentScore> {
    await this.validservice.authorizeTeacher();
    await this.validservice.checkDuplicateStudentScore(studentScore);

    await Promise.all([
      this.validservice.checkExitedLessionById(studentScore.lessionId),
      this.validservice.checkExitedUser(studentScore.studentId, studentType),
    ]);

    await this.validservice.verifyTeacherAndStudentRelation(
      studentScore.studentId,
    );

    studentScore.status = activedStatus;
    return this.studentScoreRepo.create(studentScore);
  }

  @authenticate('jwt')
  @get('/lession/get-list-of-Student-by-lession/{lessionId}')
  @response(200, {
    description: 'List of student by lession',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async findStudentByLession(
    @param.path.string('lessionId') id: string,
  ): Promise<unknown> {
    await this.validservice.authorizeTeacher();

    const studentLessionList = await this.studentScoreRepo.find({
      where: {lessionId: id},
    });
    const studentIDlist = await Promise.all(
      studentLessionList.map(async studentLession => {
        return {id: studentLession.studentId};
      }),
    );

    const studentList = await this.userRepository.find({
      where: {
        or: studentIDlist,
      },
    });

    return studentList;
  }
}
