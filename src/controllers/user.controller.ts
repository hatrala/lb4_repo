// import { TokenService} from '@loopback/authentication';
import {
  TokenServiceBindings,
} from '@loopback/authentication-jwt';
import {inject, service} from '@loopback/core';
import {
  repository,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  post,
  Request,
  requestBody,
  response,
  RestBindings,
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import bcrypt from 'bcryptjs';
import { User} from '../models';
import {ClassRoomRepository, StudentScoreRepository, UserRepository} from '../repositories';
import {ValidateService} from '../services/validate.service'
import {NonDbService} from '../services/NonDB.service'
import { Proceducer } from '../services';
import {authenticate} from '@loopback/authentication';
import {promisify} from 'util';
import {UserService} from '../services/user.service';

const jwt = require('jsonwebtoken');
const verifyAsync = promisify(jwt.verify);

@authenticate('jwt')
export class UserController {


  constructor(
    @inject(TokenServiceBindings.TOKEN_SECRET)
    private jwtSecret: string,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @inject(RestBindings.Http.REQUEST) private req: Request,

    @repository(UserRepository)
    protected userRepository: UserRepository,
    @repository(ClassRoomRepository)
    protected classRoomRepository: ClassRoomRepository,
    @repository(StudentScoreRepository)
    protected studentLessionRepo: StudentScoreRepository,

    @service(UserService)
    public userService: UserService,
    @service(ValidateService)
    public validService: ValidateService,
    @service(NonDbService)
    public nonDbService: NonDbService,
    @service(Proceducer)
    public proceducer: Proceducer
  ) {}


  @post('/User/Create')
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
              'email', 'classRoomId', 'status'
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

  @authenticate.skip()
  @post('/User/login', {
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
              'modifiedByID', 'type', 'classRoomId', 'status'
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

    @get('/User/GetAll')
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
    return this.userRepository.find({
      where: {
        or:[
          {status: 'Active'},
          {status: 'Draft'}
        ]},
        include: ["classRoom"]});
  }

    @del('/User/DeleteStudent/{studentID}')
    @response(204, {
      description: 'Student DELETE success',
    })
    async deleteStudentById(
      @param.path.string('studentID') id: string

      ): Promise<void> {

        try {

          await this.userRepository.updateById(id, {status: 'Deactive'})

          await this.studentLessionRepo.updateAll({status: "Deactive"}, {studentID: id})

        } catch (error) {

          console.log(error);

        }

    }

    @del('/User/DeleteTeacher/{teacherID}')
    @response(204, {
      description: 'Teacher DELETE success',
    })
    async deleteTeacherById(
      @param.path.string('teacherID') id: string

      ): Promise<void> {

        try {

          const foundTeacher = await this.userRepository.findById(id)

          if(foundTeacher.classRoomId) {

           await Promise.all([

              this.userRepository.updateById(id, {status: 'Deactive'}),

              this.classRoomRepository.updateById(foundTeacher.classRoomId, {status: 'Draft'})

            ])

          }else {

            await this.userRepository.updateById(id, {status: 'Deactive'});

          }

        } catch (error) {

          console.log(error);

        }

    }

    @del('User/DeleteManyTeacher')
    @response(204, {
      description: 'Teacher DELETE success',
    })
    async deleteManyTeacherById(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              items: getModelSchemaRef(User, {
                exclude: [
                  "age", 'classRoomId', 'created',
                  'createdByID', 'email', 'gender',
                  'modified', 'modifiedByID', 'name',
                  'password', 'status', 'type', 'username'
                ]
              }),
              type: "array"
            }
          },
        },
      })
      userarray: User[]

      ): Promise<void> {

        const type = "Teacher"

        await this.userService.deActiveUser(userarray, type)

    }

    @del('User/DeleteManyStudent')
    @response(204, {
      description: 'Student DELETE success',
    })
    async deleteManyStudentById(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              items: getModelSchemaRef(User, {
                exclude: [
                  "age", 'classRoomId', 'created',
                  'createdByID', 'email', 'gender',
                  'modified', 'modifiedByID', 'name',
                  'password', 'status', 'type', 'username'
                ]
              }),
              type: "array"
            },
          },
        },
      })
      userarray: User[]

      ): Promise<void> {
        const type = "Student"

        await this.userService.deActiveUser(userarray, type)

    }

    @get('/something')
  something(): void {
    // Use your header.
    // e.g. Log to console
    console.log(this.req.headers.authorization);
    const token  = this.req.headers.authorization!.split(" ")[1]
    console.log(token);
    const decode = verifyAsync(token, this.jwtSecret)
    console.log(decode);


  }


  }


