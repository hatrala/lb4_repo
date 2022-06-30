import {Constructor, service} from '@loopback/core';
import {
  repository,
} from '@loopback/repository';
import {
  post,
  getModelSchemaRef,
  requestBody,
  response,
  HttpErrors,
  patch,
  param,
  get,
} from '@loopback/rest';
import {activedStatus} from '../config';
import {ControllerMixin, ControllerMixinOptions} from '../mixins/controller-mixin';
import {Lession, StudentScore, User} from '../models';
import {LessionRepository, StudentScoreRepository, UserRepository} from '../repositories';
import {ValidateService} from '../services';

const options: ControllerMixinOptions = {
  basePath: 'lession',
  modelClass: Lession,
};

export class LessionController extends ControllerMixin<
  Lession,
  Constructor<Object>
>(Object, options) {
  constructor(
    @repository(LessionRepository)
    public mainRepo : LessionRepository,
    @repository(StudentScoreRepository)
    public studentScoreRepo : StudentScoreRepository,
    @repository(UserRepository)
    public userRepository : UserRepository,
    @service(ValidateService)
    public validservice : ValidateService
  ) {
    super();
  }

  @post('/Create-lession')
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
              'id', 'created', 'createdByID',
              'modified', 'modifiedByID', 'status'
            ],
          }),
        },
      },
    })
    lession: Omit<Lession, 'id'>,
  ): Promise<Lession> {
    const isExited = await this.mainRepo.findOne({where: {lessionName: lession.lessionName}})
    if(isExited) {
      throw new HttpErrors.NotAcceptable("This lession name already exited")
    }
    return this.mainRepo.create(lession);

  }

  @post('/LessionController/Student-scorce')
  @response(200, {
    description: 'Lession model instance',
    content: {'application/json': {schema: getModelSchemaRef(StudentScore)}},
  })
  async createStudentScore(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(StudentScore, {
            title: 'NewStudentScore',
            exclude: [
              'id', 'created', 'createdByID',
              'modified', 'modifiedByID', 'score', 'status'
            ],
          }),
        },
      },
    })
    studentScore: Omit<StudentScore, 'id'>,
  ): Promise<StudentScore> {

    const isExitedStudentScore = await this.studentScoreRepo.findOne({where: {studentID: studentScore.studentID, lessionID: studentScore.lessionID}})

    if (isExitedStudentScore) {

      throw new HttpErrors.NotAcceptable("StudentScore already exited")

    }


     const checkExitedLession = async () => {

      const isExitedLession = await this.mainRepo.findById(studentScore.lessionID)

      if(!isExitedLession) {

       throw new HttpErrors.NotAcceptable("Lession not exist")

      }
    }

    const type = "Student"

    await Promise.all([

      checkExitedLession(),

      this.validservice.checkExitedUser(studentScore.studentID, type)

    ])

    studentScore.status = activedStatus
    return this.studentScoreRepo.create(studentScore)

  }

  @get('/LessionController/get-list-of-Student-by-lession/{lessionID}')
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

      @param.path.string ('lessionID') id: string,

    ): Promise<unknown> {

      const studentLessionList = await this.studentScoreRepo.find({where: {lessionID: id}});

      const studentIDlist = await Promise.all(

        studentLessionList.map(async (studentLession) => {

          return {id: studentLession.studentID}

        })

      )

      const studentList = await this.userRepository.find({
        where: {
          or:studentIDlist
        }
      })

      return studentList

    }


  @patch('/LessionController/Eddit Score')
  async edditScore(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(StudentScore, {
            title: 'NewStudentScore',
            exclude: [
              'id', 'created', 'createdByID',
              'modified', 'modifiedByID', 'status'
            ],
          }),
        },
      },
    })
    studentScore: Omit<StudentScore, 'id'>,
  ): Promise<void> {

    const foundStudentScore = await this.studentScoreRepo.findOne({
      where:{
        studentID: studentScore.studentID,
        lessionID: studentScore.lessionID
      }
    })

    if(foundStudentScore) {

      throw new HttpErrors.NotAcceptable("Student may not existed or student did not learn this lession")

    }

    await this.studentScoreRepo.updateById(foundStudentScore!.id, {score: studentScore.score});

    }


}
