import {
  repository,
} from '@loopback/repository';
import {
  post,
  getModelSchemaRef,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {Lession, StudentScore} from '../models';
import {LessionRepository, StudentScoreRepository, UserRepository} from '../repositories';

export class LessionController {
  constructor(
    @repository(LessionRepository)
    public lessionRepository : LessionRepository,
    @repository(StudentScoreRepository)
    public studentScoreRepo : StudentScoreRepository,
    @repository(UserRepository)
    public userRepository : UserRepository
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
              'modified', 'modifiedByID',
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
              'modified', 'modifiedByID', 'score'
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
     const checkExitedStudent = async () => {

       const isExitedStudent = await this.userRepository.findById(studentScore.studentID)

       if(!isExitedStudent) {

        throw new HttpErrors.NotAcceptable("Student not exist")

       }else if(isExitedStudent.type !== "Student") {

        throw new HttpErrors.NotAcceptable("This id is not a StudentID")

       }
     }
     const checkExitedLession = async () => {

      const isExitedLession = await this.lessionRepository.findById(studentScore.lessionID)

      if(!isExitedLession) {

       throw new HttpErrors.NotAcceptable("Lession not exist")

      }
    }


    await Promise.all([checkExitedLession(), checkExitedStudent()])

    return this.studentScoreRepo.create(studentScore)

  }




}
