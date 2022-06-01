import { repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';

// import bcrypt from 'bcryptjs'
// import {setTimeout} from 'timers';
import validator from 'validator';
import {User} from '../models';
import {UserRepository} from '../repositories';


export class NonDbService {
  constructor(
    @repository(UserRepository) protected userRepository:UserRepository
  ){}

  async verifyEmailAndPassWord(requestUser: User): Promise<void> {

    const verifyEmail = () =>{
      const isEmail = validator.isEmail(requestUser.email)

      if (!isEmail) {
        return "Email is not valid"
      }
    }

    const verifyPassWord = async () =>{
      const isValidPassWord =
    validator.isStrongPassword(requestUser.password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })

    if (!isValidPassWord) {
      return "Password is not match requirements"
    }
    }

    await Promise.all([verifyEmail(), verifyPassWord()]).then(result =>{

      if(typeof result[0] === typeof "string" || typeof result[1] === typeof "string"){
        throw new HttpErrors.NotAcceptable(`${result}`)

      }

    })
}

}
