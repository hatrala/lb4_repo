import { authenticate, TokenService} from '@loopback/authentication';
import {
  // Credentials,
  // MyUserService,
  TokenServiceBindings,
  // User,
  // UserRepository,
  UserServiceBindings
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {
  // Count,
  // CountSchema,
  // Filter,
  // FilterExcludingWhere,
  repository,
  // Where
} from '@loopback/repository';
import {
  del,
   get,
  getModelSchemaRef, HttpErrors,
  param,
  // patch,
  post,
  // put,
  requestBody,
  response,
  SchemaObject
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
// import {genSalt, hash} from 'bcryptjs';
import {User} from '../models';
import {UserRepository} from '../repositories';
import { MyUserService, } from '../services/user.service';
// import { Credentials,} from '../services/user.service';
import bcrypt from 'bcryptjs'
import * as jwt from "jsonwebtoken";
import validator from 'validator';
// import {omit} from 'lodash';

const LoginSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 8,
    },
  },
};

export const LoginRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: LoginSchema},
  },
};




export class UserController {
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
  ) {}

  @post('/users/singup')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {
          exclude: ['id', 'password'],
          })
        }
      },
  })
  async create(

    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: ['id'],
          }),
        },
      },
    })
    user: User
  ): Promise<User> {


    const generateID = async () => {
       const count = await this.userRepository.count()
       return  count.count + 1;

    }

    const validate = async (newUser: User) => {

      if(await this.userRepository.findOne({where:{username: newUser.username}}))
      {
        // console.log(await this.userRepository.findOne({where:{username: newUser.username}}))

        throw new HttpErrors.NotAcceptable("username is exited");

      }

      if(await this.userRepository.findOne({where:{email: newUser.email}}))
      {

        throw new HttpErrors.NotAcceptable("email is exited");

      }

      if(!validator.isEmail(newUser.email))
      {

        throw new HttpErrors.NotAcceptable("Email is not valid");

      }

      if(!validator.isStrongPassword(newUser.password,{minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}))
      {

        throw new HttpErrors.NotAcceptable("Password is not match requirements");

      }

    }


      await validate(user);

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
    content:{
      'application/json': {
        "schema": {
          message: String
        }
      }
    }
  })
  async deleteById(@param.path.number('id') id: number): Promise<String> {
    await this.userRepository.deleteById(id);
    const message = "delete successful";
    return message
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
            exclude: ['email', 'id'],
          }),
        },
      },
    })
    user: User
  ): Promise<{token: String}> {

    const checkUserName =async (requestUser:User) => {
        if(!await this.userRepository.findOne({where: {username: requestUser.username}}))
          throw new HttpErrors[404]("Username not exited")
      }
    const checkPass =async (requestUser:User) => {

      const foundUser = await this.userRepository.findOne({where:{username: requestUser.username}});

      const pass =  foundUser?.password.toString();

      if(!await bcrypt.compare(requestUser.password, pass!))
      {
        throw new HttpErrors.NotAcceptable("password is wrong")
      }

    }

    const generatedToken =async (requestUser:User) => {

      const foundUser = await this.userRepository.findOne({where:{username: requestUser.username}});

      const email = foundUser?.email.toString();
      const username = foundUser?.username.toString()

      const token = jwt.sign(
        { useremail: email, username: username },
        "superSecretKey",
        { expiresIn: "1h" }
      );
      return token;
    }
    await checkUserName(user);
    await checkPass(user);

    const token = await generatedToken(user);

    return {token};


  }


  @authenticate('jwt')
  @get('/users/getInfo', {
    responses: {
      '200': {
        description: 'Return current user',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User, {
              exclude: ['id', 'password'],
              })
          },
        },
      },
    },
  })
  async whoAmI(

  ): Promise<void> {

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

//   @get('/users/{id}')
//   @response(200, {
//     description: 'User model instance',
//     content: {
//       'application/json': {
//         schema: getModelSchemaRef(User, {includeRelations: true}),
//       },
//     },
//   })
//   async findById(
//     @param.path.number('id') id: number,
//     @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>
//   ): Promise<User> {
//     return this.userRepository.findById(id, filter);
//   }

//   @patch('/users/{id}')
//   @response(204, {
//     description: 'User PATCH success',
//   })
//   async updateById(
//     @param.path.number('id') id: number,
//     @requestBody({
//       content: {
//         'application/json': {
//           schema: getModelSchemaRef(User, {partial: true}),
//         },
//       },
//     })
//     user: User,
//   ): Promise<void> {
//     await this.userRepository.updateById(id, user);
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
 }
