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
  // Count,
  // CountSchema,
  // Filter,
  repository,
} from '@loopback/repository';
import {
  // del,
  // get,
  getModelSchemaRef,
  // HttpErrors,
  // param,
  // patch,
  post,
  // put,
  requestBody,
  response,
  // SchemaObject,
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
// import { Credentials,} from '../services/user.service';
import bcrypt from 'bcryptjs';
// import * as jwt from 'jsonwebtoken';
// import {genSalt, hash} from 'bcryptjs';
import {Student, Teacher, User} from '../models';
import {UserRepository} from '../repositories';
import {AutheSevice, MyUserService, } from '../services/user.service';
import {ValidateService} from '../services/validate.service'
import {NonDbService} from '../services/NonDB.service'
// import {omit} from 'lodash';
// import { connect } from 'amqplib/callback_api';
import { Proceducer } from '../services';

export class UserController {

  // autheSevice: AutheSevice;

  constructor(
    // @repository(UserRepository)
    // public userRepository : UserRepository,
    // @inject(TokenServiceBindings.TOKEN_SERVICE)
    // public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(UserRepository) protected userRepository: UserRepository,
    @service(AutheSevice) public autheSevice: AutheSevice,
    @service(ValidateService) public validService: ValidateService,
    @service(NonDbService) public nonDbService: NonDbService,
    @service(Proceducer) public proceducer: Proceducer
  ) {}



  @post('/users/create-teacher')
  @response(200, {
    description: 'desc',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async createTeacher(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Teacher, {
            title: 'NewTeacher',
            exclude: ['id', 'created', 'modified', 'type', 'lessonGroupId'],
          }),
        },
      },
    })
    user: Omit<User, 'id, type'>,
  ): Promise<User> {

    await this.nonDbService.verifyEmailAndPassWord(user)
    await this.validService.validateDuplicateUser(user)


    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    user.type = 'Teacher'
    await this.userRepository.create(user);


    user.password = '****';
    return user;

  }

  @post('/users/create-student')
  @response(200, {
    description: 'desc 2',
    content: {'application/json': {schema: getModelSchemaRef(Student)}},
  })
  async createStudent(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Student, {
            title: 'NewStudent',
            exclude: ['id', 'created', 'modified',"type"],
          }),
        },
      },
    })
    user: Omit<Student, 'id, type'>,
  ): Promise<User> {

    await this.nonDbService.verifyEmailAndPassWord(user)
    await this.validService.validateDuplicateUser(user)


    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    user.type = 'Student'
    await this.userRepository.create(user);


    user.password = '****';
    return user;

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
              'age', 'gender', 'major',
              'school', 'pocket', 'type',
              'modified', 'created' ],
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


  // @post('/users/singup')
  // @response(200, {
  //   description: 'User model instance',
  //   content: {
  //     'application/json': {
  //       schema: getModelSchemaRef(User, {
  //         exclude: ['id', 'password'],
  //       }),
  //     },
  //   },
  // })
  // async signup(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(User, {
  //           title: 'NewUser',
  //           exclude: ['id', 'pocket', 'modified', 'created'],
  //         }),
  //       },
  //     },
  //   })
  //   user: User,
  // ): Promise<User> {


  //   await this.nonDbService.verifyEmailAndPassWord(user)
  //   await this.validService.validateDuplicateUser(user)


  //   const salt = await bcrypt.genSalt(10);
  //   user.password = await bcrypt.hash(user.password, salt);

  //   // user.password = await hash(user.password, await genSalt(10))

  //   await this.userRepository.create(user);
  //   user.password = '****';
  //   return user;
  // }



  // @authenticate('jwt')
  // @get('/users/getInfo', {
  //   responses: {
  //     '200': {
  //       description: 'Return current user',
  //       content: {
  //         'application/json': {
  //           schema: getModelSchemaRef(User, {
  //             exclude: ['id', 'password'],
  //           }),
  //         },
  //       },
  //     },
  //   },
  // })
  // async whoAmI(): Promise<void> {}

  // @patch('/updateGroupId/{userId}')
  // @response(204, {
  //   description: 'User PATCH success',
  // })
  // async updateById(
  //   @param.path.number('userId') id: number,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(User, {
  //           partial: true,
  //           exclude: ['id', 'password', 'username'],
  //         }),
  //       },
  //     },
  //   })
  //   user: User,
  // ): Promise<void> {
  //   await this.userRepository.updateById(id, user);
  // }

  //   @get('/users/count')
  //   @response(200, {
  //     description: 'User model count',
  //     content: {'application/json': {schema: CountSchema}},
  //   })
  //   async count(
  //     @param.where(User) where?: Where<User>,
  //   ): Promise<Count> {
  //     return this.userRepository.count(where);
  //   }

  //   @get('/users')
  //   @response(200, {
  //     description: 'Array of User model instances',
  //     content: {
  //       'application/json': {
  //         schema: {
  //           type: 'array',
  //           items: getModelSchemaRef(User, {includeRelations: true}),
  //         },
  //       },
  //     },
  //   })
  // async find(
  //   @param.filter(User) filter?: Filter<User>,
  // ): Promise<User[]> {
  //   return this.userRepository.find(filter);
  // }

  //   @patch('/users')
  //   @response(200, {
  //     description: 'User PATCH success count',
  //     content: {'application/json': {schema: CountSchema}},
  //   })
  //   async updateAll(
  //     @requestBody({
  //       content: {
  //         'application/json': {
  //           schema: getModelSchemaRef(User, {partial: true}),
  //         },
  //       },
  //     })
  //     user: User,
  //     @param.where(User) where?: Where<User>,
  //   ): Promise<Count> {
  //     return this.userRepository.updateAll(user, where);
  //   }



  //   @put('/users/{id}')
  //   @response(204, {
  //     description: 'User PUT success',
  //   })
  //   async replaceById(
  //     @param.path.number('id') id: number,
  //     @requestBody() user: User,
  //   ): Promise<void> {
  //     await this.userRepository.replaceById(id, user);
  //   }

  //   @del('/users/{id}')
  //   @response(204, {
  //     description: 'User DELETE success',
  //   })
  //   async deleteById(@param.path.number('id') id: number): Promise<void> {
  //     await this.userRepository.deleteById(id);
  //   }




  // @get('/users/{id}')
  //   @response(200, {
  //     description: 'User model instance',
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(User,{
  //         includeRelations: true,

  //       }),
  //       },
  //     },
  //   })
  //   async findById(
  //     @param.path.number('id') id: number,
  //   ): Promise<Omit<User, 'password'>> {
  //     const foundUser = this.userRepository.findById(id);
  //     return foundUser
  //   }

  // @post('/send')
  // async send(
  //   @requestBody({
  //     content: {
  //     'application/json': {
  //       schema: getModelSchemaRef(User, {
  //         title: 'requestUser',
  //         exclude: ['username', 'id'],
  //       }),
  //     },
  //   },
  // })
  //   user: User,
  // ): Promise<void> {
  //   await this.proceducer.sendToQueue(user, "userqueue")
  // }

  // @get("/receive")
  // @response(200, {
  //   description: 'User model instance',
  //   content: {
  //     'application/json': {
  //       schema: getModelSchemaRef(User,{
  //       includeRelations: true,

  //     }),
  //     },
  //   },
  // })
  // // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // async receiveUser(): Promise<any> {
  //   // console.log(this.proceducer.receiveFromQueue("userqueue"));
  //    await this.proceducer.receiveFromQueue("userqueue")


  // }



}
