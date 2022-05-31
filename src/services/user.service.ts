// import {UserService} from '@loopback/authentication';
// import {repository} from '@loopback/repository';
// import {HttpErrors} from '@loopback/rest';
// import {securityId, UserProfile} from '@loopback/security';
// import {compare} from 'bcryptjs';
// // User --> MyUser
// import {User} from '../models';
// // UserRepository --> MyUserRepository
// import {UserRepository} from '../repositories';

// export type Credentials = {
//   email: string;
//   password: string;
// };

// // User --> MyUser
// export class CustomUserService implements UserService<User, Credentials> {
//   constructor(
//     // UserRepository --> MyUserRepository
//     @repository(UserRepository) public userRepository: UserRepository,
//   ) {}

//   // User --> MyUser
//   async verifyCredentials(credentials: Credentials): Promise<User> {
//     const invalidCredentialsError = 'Invalid email or password.';

//     const foundUser = await this.userRepository.findOne({
//       where: {email: credentials.email},
//     });
//     if (!foundUser) {
//       throw new HttpErrors.Unauthorized(invalidCredentialsError);
//     }

//     const credentialsFound = await this.userRepository.findCredentials(
//       foundUser.id,
//     );
//     if (!credentialsFound) {
//       throw new HttpErrors.Unauthorized(invalidCredentialsError);
//     }

//     const passwordMatched = await compare(
//       credentials.password,
//       credentialsFound.password,
//     );

//     if (!passwordMatched) {
//       throw new HttpErrors.Unauthorized(invalidCredentialsError);
//     }

//     return foundUser;
//   }

//   // User --> MyUser
//   convertToUserProfile(user: User): UserProfile {
//     return {
//       [securityId]: user.id.toString(),
//       name: user.username,
//       id: user.id,
//       email: user.email,
//     };
//   }
// }
