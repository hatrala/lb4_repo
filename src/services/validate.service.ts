import { repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
// import bcrypt from 'bcryptjs'
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
// import {setTimeout} from 'timers';
import {ClassRoom, User} from '../models';
import {ClassRoomRepository, UserRepository} from '../repositories';
export class ValidateService {
  constructor(
    @repository(UserRepository)
    protected userRepository: UserRepository,
    @repository(ClassRoomRepository)
    protected classRoomRepository: ClassRoomRepository
  ) {}

  async verifyLoginInformation(requestUser: User): Promise<void> {
    const exitedUser = await this.userRepository.findOne({
      where:
      {email: requestUser.email},
    })
    if (!exitedUser)
    {
      throw new HttpErrors[404]('User not exited');
    }
    const userPassWord = exitedUser.password.toString();

    const comparePassword = await bcrypt.compare(requestUser.password, userPassWord!)

    if (!comparePassword) {

      throw new HttpErrors.NotAcceptable('password is wrong');
    }


  }

  async generateToken(requestUser: User): Promise<String> {
    const foundUser = await this.userRepository.findOne({
      where: {username: requestUser.username},
    });

    const email = foundUser?.email.toString();
    const username = foundUser?.username.toString();
    const id = foundUser?.id
    const usertype = foundUser?.type

    const token = jwt.sign(
      {
        id: id,  useremail: email,
        username: username, type: usertype
      },
      'superSecretKey',
      {expiresIn: '1h'},
    );
    return token;
  }

 async checkDuplicateUserName(userName:string) {
  const isExited =  await this.userRepository.findOne({
    where: {
      username: userName,
    },
  })

  if(isExited) {

    throw new HttpErrors.NotAcceptable("User Exited")

  }

 }
  async validateDuplicateUser(newUser: User): Promise<void> {

      const checkDublicateName = async () =>{
        const name =  await this.userRepository.findOne({
          where: {
            username: newUser.username,
          },
        })

        if(name){
          return false
        }
      }

      const checkDublicateEmail = async () =>{
        const email = await this.userRepository.findOne({
          where: {
            email: newUser.email,
          },
        })

        if(email){
          return false
        }
      }

      await Promise.all([checkDublicateName(), checkDublicateEmail()]).then(result =>{
        if(result[0] === false || result[1] === false){
          throw new HttpErrors.NotAcceptable("User Exited")
        }
      })
  }

 async checkDuplicateClass (classRoom:ClassRoom): Promise<void> {
    const isDuplicate = await this.classRoomRepository.findOne({
      where: {
          className: classRoom.className
      }
    })

    if(isDuplicate) {
      throw new HttpErrors.NotAcceptable(`this class: ${classRoom.className} is already exited `)
    }
 }


}
