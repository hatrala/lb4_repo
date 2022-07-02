// import { TokenService} from '@loopback/authentication';
import {authenticate} from '@loopback/authentication';
import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {Constructor, inject, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  put,
  Request,
  requestBody,
  response,
  RestBindings,
  SchemaObject,
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {ClassRoom, User} from '../models';
import {
  ClassRoomRepository,
  StudentScoreRepository,
  UserRepository,
} from '../repositories';
import {Proceducer} from '../services';
import {NonDbService} from '../services/NonDB.service';
import {ValidateService} from '../services/validate.service';
// import {promisify} from 'util';
import {UserService} from '../services/user.service';

import {deletedStatus} from '../config';
import {
  ControllerMixin,
  ControllerMixinOptions,
} from '../mixins/controller-mixin';
import {AuditingRepository} from '../mixins/repository-mixin';

// const jwt = require('jsonwebtoken');
// const verifyAsync = promisify(jwt.verify);

const ChangePasswordSchema: SchemaObject = {
  type: 'object',
  required: ['oldpassword', 'newpassword'],
  properties: {
    oldpassword: {
      type: 'string',
    },
    newpassword: {
      type: 'string',
    },
  },
};

// const UserFilter: SchemaObject = {
//   type: 'object',
//   properties: {
//     id: {
//       type: 'string',
//     },
//     username: {
//       type: 'string',
//     },
//     email: {
//       type: 'string',
//     },
//     gender: {
//       type: 'string',
//     },
//     name: {
//       type: 'string',
//     },
//     type: {
//       type: 'string',
//     },
//     age: {
//       type: "number",
//     },
//   },
// };

const userUpdateData: SchemaObject = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
    },
    email: {
      type: 'string',
    },
    gender: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    age: {
      type: 'number',
    },
  },
};

const options: ControllerMixinOptions = {
  basePath: 'user',
  modelClass: User,
};

export class UserController extends ControllerMixin<
  User,
  Constructor<Object>,
  AuditingRepository<User, string>
>(Object, options) {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SECRET)
    private jwtSecret: string,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @inject(RestBindings.Http.REQUEST) private req: Request,

    @repository(UserRepository)
    public mainRepo: UserRepository,
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
    public proceducer: Proceducer,
  ) {
    super();
  }

  @authenticate('jwt')
  @get('/user/classInfo')
  @response(200, {
    description: 'Class model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(ClassRoom, {includeRelations: true}),
        },
      },
    },
  })
  async getClassInfo(): Promise<ClassRoom> {
    const user = await this.validService.headerTokenDecode();
    return this.classRoomRepository.findById(user.classid);
  }

  @post('/user/create-with-conditions')
  @response(200, {
    description: 'desc',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {
          exclude: ['password'],
        }),
      },
    },
  })
  async createUser(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: [
              'id',
              'created',
              'modified',
              'createdByID',
              'modifiedByID',
              'classRoomId',
              'status',
            ],
          }),
        },
      },
    })
    user: Omit<User, 'id'>,
  ): Promise<User> {
    await this.validService.verifyUserWhenCreate(user);

    // user.email = await this.nonDbService.generateEmail(user)

    user.password = await this.nonDbService.hashPassword(user.password);

    return this.mainRepo.create(user);
  }

  @authenticate.skip()
  @post('/user/login', {
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
              'username',
              'id',
              'name',
              'age',
              'gender',
              'modified',
              'created',
              'createdByID',
              'modified',
              'modifiedByID',
              'type',
              'classRoomId',
              'status',
            ],
          }),
        },
      },
    })
    user: User,
  ): Promise<{token: String}> {
    await this.validService.verifyUserWhenLogin(user);
    const token = await this.validService.generateToken(user);
    return {token};
  }

  @get('/user/GetUserOlderThan{age}')
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
  async findUserOlder(@param.path.number('age') age: number): Promise<User[]> {
    return this.mainRepo.find(
      {
        where: {
          age: {
            gt: age,
          },
        },
      },
      {include: ['classRoom']},
    );
  }

  @get('/user/GetUserYoungerThan{age}')
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
  async findUserYounger(
    @param.path.number('age') age: number,
  ): Promise<User[]> {
    return this.mainRepo.find(
      {
        where: {
          age: {
            lt: age,
          },
        },
      },
      {include: ['classRoom']},
    );
  }

  @patch('/user/UpdateInfo/{userid}')
  async updateUserInfo(
    @param.path.string('userid') userid: string,
    @requestBody({
      content: {
        'application/json': {
          schema: userUpdateData,
        },
      },
    })
    updateData: typeof userUpdateData,
  ): Promise<void> {
    await this.validService.checkDuplicateUserWhenUpdate(updateData);
    await this.mainRepo.updateById(userid, updateData);
  }

  @put('/user/replace')
  async replaceUser(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            items: getModelSchemaRef(User, {
              exclude: [],
            }),
          },
        },
      },
    })
    updateData: User,
  ): Promise<void> {
    await this.validService.checkDuplicateUserWhenUpdate(updateData);
    await this.mainRepo.replaceById(updateData.id, updateData);
  }

  @authenticate('jwt')
  @patch('/user/ChangePassword')
  async changePassword(
    @requestBody({
      content: {
        'application/json': {
          schema: ChangePasswordSchema,
        },
      },
    })
    changePasswordObject: typeof ChangePasswordSchema,
  ): Promise<void> {
    await this.nonDbService.verifyPasswordFormatBeforeChange(
      changePasswordObject,
    );
    await this.validService.verifyOldPasswordBeforeChangePassword(
      changePasswordObject.oldpassword,
    );
    await this.userService.changePassword(changePasswordObject.newpassword);
  }

  @del('/user/DeleteStudent/{studentId}')
  @response(204, {
    description: 'Student DELETE success',
  })
  async deleteStudentById(
    @param.path.string('studentId') id: string,
  ): Promise<void> {
    try {
      await this.mainRepo.updateById(id, {status: deletedStatus});
      await this.studentLessionRepo.updateAll(
        {status: deletedStatus},
        {studentId: id},
      );
    } catch (error) {
      throw new HttpErrors.NotAcceptable(error);
    }
  }

  // @del('/user')
  // @response(204, {
  //   description: 'User DELETE success',
  // })
  // async deleteUser(
  //   @param.query.object("userFilter", UserFilter) filter: typeof UserFilter
  //   ): Promise<string> {
  //     try {
  //       const numberOfObjectDeleted = await this.mainRepo.deleteAll(filter)
  //       return `Deleted ${numberOfObjectDeleted.count} User`
  //     } catch (error) {
  //       throw new HttpErrors.NotAcceptable(error)
  //     }
  // }

  @del('/user/DeleteTeacher/{teacherID}')
  @response(204, {
    description: 'Teacher DELETE success',
  })
  async deleteTeacherById(
    @param.path.string('teacherID') id: string,
  ): Promise<void> {
    try {
      const foundTeacher = await this.mainRepo.findById(id);

      if (foundTeacher.classRoomId) {
        await Promise.all([
          this.mainRepo.updateById(id, {status: deletedStatus}),

          this.classRoomRepository.updateById(foundTeacher.classRoomId, {
            status: deletedStatus,
          }),
        ]);
      } else {
        await this.mainRepo.updateById(id, {status: deletedStatus});
      }
    } catch (error) {
      console.log(error);
    }
  }

  @del('user/DeleteManyTeacher')
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
                'age',
                'classRoomId',
                'created',
                'createdByID',
                'email',
                'gender',
                'modified',
                'modifiedByID',
                'name',
                'password',
                'status',
                'type',
                'username',
              ],
            }),
            type: 'array',
          },
        },
      },
    })
    userarray: User[],
  ): Promise<void> {
    const type = 'Teacher';

    await this.userService.deActiveUser(userarray, type);
  }

  @authenticate('jwt')
  @del('user/DeleteManyStudent')
  @response(204, {
    description: 'Student DELETE success',
  })
  async deleteManyStudentById(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'array',
          },
        },
      },
    })
    userarray: Array<string>,
  ): Promise<void> {
    await this.validService.authorizeTeacher();

    const idArray = await this.userService.createIdArrayFromStringArray(
      userarray,
    );

    await this.mainRepo.deleteAll({or: idArray});
  }
}
