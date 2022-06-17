// import { TokenService} from '@loopback/authentication';
import {
  // Credentials,
  // MyUserService,
  // TokenServiceBindings,
  // User,
  // UserRepository,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {inject, service} from '@loopback/core';
import {
  Count,
  CountSchema,
  // Count,
  // CountSchema,
  // Filter,
  repository, Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import bcrypt from 'bcryptjs';
import { User} from '../models';
import {ClassRoomRepository, StudentScoreRepository, UserRepository} from '../repositories';
import {AutheSevice, MyUserService, } from '../services/user.service';
import {ValidateService} from '../services/validate.service'
import {NonDbService} from '../services/NonDB.service'
import { Proceducer } from '../services';

export class UserController {

  constructor(
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,

    @repository(UserRepository)
    protected userRepository: UserRepository,
    @repository(ClassRoomRepository)
    protected classRoomRepository: ClassRoomRepository,
    @repository(StudentScoreRepository)
    protected studentScoreRepo: StudentScoreRepository,

    @service(AutheSevice)
    public autheSevice: AutheSevice,
    @service(ValidateService)
    public validService: ValidateService,
    @service(NonDbService)
    public nonDbService: NonDbService,
    @service(Proceducer)
    public proceducer: Proceducer
  ) {}


  @post('/Create/user')
  @response(200, {
    description: 'desc',
    content: {'application/json': {
      schema: getModelSchemaRef(User, {
        exclude: ['password']
      })
    }},
  })
  async createUser(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: [
              'id', 'created', 'modified',
               'createdByID', 'modifiedByID',
              'email', 'classRoomId'
            ],
          }),
        },
      },
    })
    user: Omit<User, 'id'>,
  ): Promise<User> {

    await this.nonDbService.verifyPassword(user)

    await this.validService.checkDuplicateUserName(user.username)

    user.email = await this.nonDbService.generateEmail(user)

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    return this.userRepository.create(user);

  }


  @post('/users/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'requestUser',
            exclude: [
              'username', 'id', 'name',
              'age', 'gender','modified',
              'created','createdByID', 'modified',
              'modifiedByID', 'type', 'classRoomId'
            ],
          }),
        },
      },
    })
    user: User,
  ): Promise<{token: String}> {

    await this.nonDbService.verifyEmailAndPassWord(user);

    await this.validService.verifyLoginInformation(user);

    const token = await this.validService.generateToken(user);

    return {token};
  }

    @get('/get-all-user')
    @response(200, {
      description: 'Array of User model instances',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(User, {includeRelations: true}),
          },
        },
      },
    })
  async find(
  ): Promise<User[]> {
    return this.userRepository.find({include: ["classRoom"]});
  }

  @patch('/addTeacherToClass/{teacherID}/{classID}')
  async addTeachToClass(
    @param.path.string('teacherID') teacherid: string,
    @param.path.string ('classID') classID: string,
  ): Promise<void> {
    const verifyTeacher = async () => {

      const foundTeacher = await this.userRepository.findById(teacherid)

      if(foundTeacher.type !== "Teacher") {

        throw new HttpErrors.NotAcceptable("user is not a teacher")
      }

      if(foundTeacher.classRoomId) {

        throw new HttpErrors.NotAcceptable("This Teacher already belong to another class")

      }
    }
    const verifyClass = async () => {

    const foundUser = await this.userRepository.find({
      where: {
        classRoomId: classID
      }
    })

    if(foundUser.length > 0) {

      throw new HttpErrors.NotAcceptable("This class is already has a teacher")
    }

  }
    // const verifyClass = async () => {
    //   const foundClass = await this.classRoomRepository.findById(classID)

    //   if(!foundClass){
    //     throw new HttpErrors.NotAcceptable("class is not exited")
    //   }
    // }

    await Promise.all([
      verifyTeacher(),
      verifyClass()
    ])

    const teacher =
    {
      classRoomId: classID
      }
    await this.userRepository.updateById(teacherid, teacher);
    }

    @patch('/addStudentToClass/{studentID}/{classID}')
  async addStudentToClass(
    @param.path.string('studentID') studentid: string,
    @param.path.string ('classID') classID: string,
  ): Promise<void> {
    const verifyStudent = async () => {
      const foundUser = await this.userRepository.findById(studentid)

      if(foundUser.type !== "Student") {
        throw new HttpErrors.NotAcceptable("user is not a Student")
      }
      if(foundUser.classRoomId) {

        throw new HttpErrors.NotAcceptable("This Student already belong to another class")

      }
    }

    await Promise.all([
      verifyStudent(),
    ])

    const student =
    {
      classRoomId: classID
      }

    await this.userRepository.updateById(studentid, student);

    }


    @get('/count-number-of-student-in-class')
    @response(200, {
      description: 'User model count',
      content: {'application/json': {schema: CountSchema}},
    })
    async count(
      @param.where(User) where?: Where<User>,
    ): Promise<Count> {

      return this.userRepository.count(where);

    }

    @get('/get-list-of-Student-in-class/{classID}')
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
    async findStudent(

      @param.path.string ('classID') classID: string,

    ): Promise<User[]> {

      return this.userRepository.find({where: {classRoomId: classID, type: "Student"}});

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

      // eslint-disable-next-line no-var


     const addStudentToList = async (list : unknown[]) => {

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
       for(const x of studentIDlist) {

        const student = await this.userRepository.findById(x.studentID);

        list.push(student);

       }

      return list

     }

     let studentList: unknown[] = []

      studentList = await addStudentToList(studentList)

      // console.log(studentList)

      return studentList

    }


    @get('/get-Teacher-info-of-class/{classID}')
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
    async findTeacher(

      @param.path.string ('classID') classID: string,

    ): Promise<User | null> {

      const foundTeacher = await this.userRepository.findOne({where: {classRoomId: classID, type: "Teacher"}});

      if(!foundTeacher) {
        throw new HttpErrors.NotAcceptable("This class dont have a teacher or class is not exited")
      }

      return foundTeacher

    }

    @del('/DeleteStudent/{studentID}')
    @response(204, {
      description: 'Student DELETE success',
    })
    async deleteStudentById(
      @param.path.string('studentID') id: string

      ): Promise<void> {

        const checkExitedStudent = async () => {

          const isExitedStudent = await this.userRepository.findById(id)

          if(!isExitedStudent) {

           throw new HttpErrors.NotAcceptable("Student not exist")

          }else if(isExitedStudent.type !== "Student") {

           throw new HttpErrors.NotAcceptable("This id is not a StudentID")

          }
        }

        await checkExitedStudent()

        await this.studentScoreRepo.deleteAll({studentID: id})

        await this.userRepository.deleteById(id);

    }

    @del('/DeleteTeacher/{teacherID}')
    @response(204, {
      description: 'Teacher DELETE success',
    })
    async deleteTeacherById(
      @param.path.string('teacherID') id: string

      ): Promise<void> {

        const checkExitedTeacher = async () => {

          const isExitedTeacher = await this.userRepository.findById(id)

          if(!isExitedTeacher) {

           throw new HttpErrors.NotAcceptable("Teacher not exist")

          }else if(isExitedTeacher.type !== "Student") {

           throw new HttpErrors.NotAcceptable("This id is not a TeacherID")

          }
        }

        await checkExitedTeacher()

        await this.userRepository.deleteById(id);

    }

  }







  




