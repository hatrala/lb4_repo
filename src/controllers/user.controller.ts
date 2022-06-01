import { TokenService} from '@loopback/authentication';
import {
  // Credentials,
  // MyUserService,
  TokenServiceBindings,
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
  del,
  get,
  getModelSchemaRef,
  // HttpErrors,
  param,
  patch,
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
import {User} from '../models';
import {UserRepository} from '../repositories';
import {AutheSevice, MyUserService, } from '../services/user.service';
import {ValidateService} from '../services/validate.service'
import {NonDbService} from '../services/NonDB.service'
// import {omit} from 'lodash';


export class UserController {

  // autheSevice: AutheSevice;

  constructor(
    // @repository(UserRepository)
    // public userRepository : UserRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(UserRepository) protected userRepository: UserRepository,
    @service(AutheSevice) public autheSevice: AutheSevice,
    @service(ValidateService) public validService: ValidateService,
    @service(NonDbService) public nonDbService: NonDbService,
  ) {}

  @post('/users/singup')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {
          exclude: ['id', 'password'],
        }),
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: ['id', 'groupId'],
          }),
        },
      },
    })
    user: User,
  ): Promise<User> {
    const generateID = async () => {
      const count = await this.userRepository.count();
      return count.count + 1;
    };

    await this.nonDbService.verifyEmailAndPassWord(user)
    await this.validService.validateDuplicateUser(user)

    user.id = await generateID();
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    // user.password = await hash(user.password, await genSalt(10))

    await this.userRepository.create(user);
    user.password = '****';
    return user;
  }

  @del('/users/{id}')
  @response(204, {
    description: 'User DELETE success',
    content: {
      'application/json': {
        schema: {
          message: String,
        },
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<String> {
    await this.userRepository.deleteById(id);
    const message = 'delete successful';
    return message;
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
            exclude: ['username', 'id', 'groupId'],
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

  @patch('/updateGroup/{id}')
  @response(204, {
    description: 'User PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            partial: true,
            exclude: ['id', 'password', 'username', 'email'],
          }),
        },
      },
    })
    user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

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

    @get('/users/{id}')
    @response(200, {
      description: 'User model instance',
      content: {
        'application/json': {
          schema: getModelSchemaRef(User,{
          includeRelations: true,

        }),
        },
      },
    })
    async findById(
      @param.path.number('id') id: number,
    ): Promise<Omit<User, 'password'>> {
      const foundUser = this.userRepository.findById(id);
      return foundUser
    }

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
}
