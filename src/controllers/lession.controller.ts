import {service} from '@loopback/core';
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
import {Lession, StudentScore, User} from '../models';
import {LessionRepository, StudentScoreRepository, UserRepository} from '../repositories';
import {ValidateService} from '../services';

export class LessionController {
  constructor(
    @repository(LessionRepository)
    public lessionRepository : LessionRepository,
    @repository(StudentScoreRepository)
    public studentScoreRepo : StudentScoreRepository,
    @repository(UserRepository)
    public userRepository : UserRepository,
    @service(ValidateService)
    public validservice : ValidateService
  ) {}

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
    const isExited = await this.lessionRepository.findOne({where: {lessionName: lession.lessionName}})
    if(isExited) {
      throw new HttpErrors.NotAcceptable("This lession name already exited")
    }
    return this.lessionRepository.create(lession);

  }

  @post('/Student-scorce')
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

      const isExitedLession = await this.lessionRepository.findById(studentScore.lessionID)

      if(!isExitedLession) {

       throw new HttpErrors.NotAcceptable("Lession not exist")

      }
    }

    const type = "Student"

    await Promise.all([

      checkExitedLession(),

      this.validservice.checkExitedUser(studentScore.studentID, type)

    ])

    studentScore.status = "Active"
    return this.studentScoreRepo.create(studentScore)

  }

  @get('/get-list-of-Student-by-lession/{lessionID}')
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

      const studentIDlist = await this.studentScoreRepo.find({where: {lessionID: id}});

     const createStudentlist = async (list : unknown[]) => {

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
       for(const x of studentIDlist) {

        const student = await this.userRepository.findById(x.studentID);

        list.push(student);

       }

      return list

     }

     let studentList: unknown[] = []

      studentList = await createStudentlist(studentList)

      // console.log(studentList)

      return studentList

    }


  @patch('/Eddit Score/{studentID}/{lessionID}')
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
