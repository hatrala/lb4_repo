import { UserService } from '@loopback/authentication';
  import { Principal } from '@loopback/security';
import { User, UserWithRelations } from '../models';
import { UserRepository } from '../repositories';
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

export interface UserProfile extends Principal {
  email?: string;
  username?: string;
}



export declare class MyUserService implements UserService<User, Credentials> {
    userRepository: UserRepository;
    constructor(userRepository: UserRepository);
    verifyCredentials(credentials: Credentials): Promise<User>;
    convertToUserProfile(user: User): UserProfile;
    findUserById(id: number): Promise<User & UserWithRelations>;
}
