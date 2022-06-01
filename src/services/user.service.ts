// import { UserService } from '@loopback/authentication';
//   import { Principal } from '@loopback/security';
import {repository} from '@loopback/repository';
// import {HttpErrors} from '@loopback/rest';
// import { User } from '../models';
import { UserRepository } from '../repositories';
// import bcrypt from 'bcryptjs'
// import * as jwt from 'jsonwebtoken';
/**
 * A pre-defined type for user credentials. It assumes a user logs in
 * using the email and password. You can modify it if your app has different credential fields
 */
export declare type Credentials = {
    email: string;
    password: string;
};
// export declare const securityId: unique symbol;
// export interface Principal {
//   /**
//    * Name/id
//    */
//   [securityId]: string;
// }

// import {User, UserRepository} from '@loopback/authentication-jwt';
// import {repository} from '@loopback/repository';

// export interface UserProfile extends Principal {
//   email?: string;
//   username?: string;
// }



export declare class MyUserService {
      //   userRepository: UserRepository;
      // constructor(userRepository: UserRepository);
      // verifyCredentials(credentials: Credentials): Promise<User>;
      // convertToUserProfile(user: User): UserProfile;
      // findUserById(id: number): Promise<User & UserWithRelations>;
}



export class AutheSevice{
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository
  ){

  }
    // async checkUserName(requestUser:User):Promise <void> {

    //     if(!await this.userRepository.findOne({where: {username: requestUser.username}}))
    //     throw new HttpErrors[404]("Username not exited")

    // }

    // async checkPass(requestUser:User):Promise <void> {

    //       const foundUser = await this.userRepository.findOne({where:{username: requestUser.username}});

    //       const pass =  foundUser?.password.toString();

    //       if(!await bcrypt.compare(requestUser.password, pass!))
    //       {
    //         throw new HttpErrors.NotAcceptable("password is wrong")
    //       }

    // }

    // async generateToken(requestUser:User):Promise <String> {

    //   const foundUser = await this.userRepository.findOne({
    //     where: {username: requestUser.username},
    //   });

    //   const email = foundUser?.email.toString();
    //   const username = foundUser?.username.toString();

    //   const token = jwt.sign(
    //     {useremail: email, username: username},
    //     'superSecretKey',
    //     {expiresIn: '1h'},
    //   );
    //   return token;

    // }


}
