import { repository} from '@loopback/repository';
import {HttpErrors, SchemaObject} from '@loopback/rest';

// import bcrypt from 'bcryptjs'
// import {setTimeout} from 'timers';
import validator from 'validator';
import {ClassRoom, ClassRoomRelations, User} from '../models';
import {UserRepository} from '../repositories';

import bcrypt from 'bcryptjs';

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

export class NonDbService {
  constructor(
    @repository(UserRepository) protected userRepository:UserRepository
  ){}

 async generateEmail(user:User): Promise<string> {
        if(user.type === 'Student') {

          return `${user.username}@stu.com`

        }else if(user.type === 'Teacher') {

          return `${user.username}@tea.com`

        }else {

          throw new HttpErrors.NotAcceptable("User type is not valid")

        }
 }

async verifyPassword(password: string):Promise<void> {
  const isValidPassWord =
    validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })

    if (!isValidPassWord) {
      throw new HttpErrors.NotAcceptable("Password is not match requirements")
    }
  }

  async verifyEmail (email: string): Promise<void>{
    const isEmail = validator.isEmail(email)

    if (!isEmail) {
      throw new HttpErrors.NotAcceptable("Email is not match requirements")
    }
  }

  async verifyEmailAndPassWord(requestUser: User): Promise<void> {

    await Promise.all([
      this.verifyEmail(requestUser.email),
      this.verifyPassword(requestUser.password)
    ])
  }

 async hashPassword(password: string): Promise<string> {

   const salt = await bcrypt.genSalt(10);
   password = await bcrypt.hash(password, salt);

   return password

 }

  async deleteNullElementFromClassArray (array:((ClassRoom & ClassRoomRelations) | undefined)[]): Promise<((ClassRoom & ClassRoomRelations) | undefined)[]> {
    for (let i = 0; i < array.length; i++) {
      if (!array[i]) {
        array.splice(i, 1);
        i--;
      }
    }
    return array
  }

 async verifyPasswordFormatBeforeChange(changePasswordObject: typeof ChangePasswordSchema): Promise<void> {

  await Promise.all([
    this.verifyPassword(changePasswordObject.newpassword),
    this.verifyPassword(changePasswordObject.oldpassword)
  ])

 }

}
