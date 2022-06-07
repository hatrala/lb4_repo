import { repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
// import bcrypt from 'bcryptjs'
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
// import {setTimeout} from 'timers';
import {Lesson, User} from '../models';
import {LessonGroupRepository, LessonRepository, MajorRepository, UserRepository} from '../repositories';
export class ValidateService {
  constructor(
    @repository(UserRepository)
    protected userRepository: UserRepository,
    @repository(LessonRepository)
    protected lessonRepository: LessonRepository,
    @repository(MajorRepository)
    protected majorRepository: MajorRepository,
    @repository(LessonGroupRepository)
    protected lessonGroupRepository: LessonGroupRepository
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

    const token = jwt.sign(
      {id: id,  useremail: email, username: username},
      'superSecretKey',
      {expiresIn: '1h'},
    );
    return token;
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

 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 async checkDuplicateMajor (majorname:string): Promise<any> {
  const isDuplicate =  await this.majorRepository.findOne({
    where: {
      majorName: majorname,
    },
  })

  if(isDuplicate){
    return true
  }
 }

async checkDuplicateLesson (lesson: Lesson):Promise<void> {

    const isDuplicate =  await this.lessonRepository.findOne({
      where: {
         lessonCode: lesson.lessonCode
          }
        })
      console.log(isDuplicate);

    if(isDuplicate){
      throw new HttpErrors.NotAcceptable("Lesson is exited")
    }
}


  async checkExitedLessonByCode (lessonCode: string):Promise<void> {
      const isExited =  await this.lessonRepository.findOne({
        where: {
            lessonCode: lessonCode
            }
          })

      if(!isExited){
        throw new HttpErrors.NotAcceptable(`Lesson with lessoncode: ${lessonCode} is not exited`)
      }
    // }
  }

  async checkDuplicateLessonGroup (groupName: string, lessonCode: string):Promise<boolean> {

    const isDuplicate =  await this.lessonGroupRepository.findOne({
      where: {
        and: [{groupName: groupName},
           {lessonCode: lessonCode}]
          }
        })

    if(isDuplicate){
      // throw new HttpErrors.NotAcceptable(`${groupName} is already exited in ${lessonCode}`)
      return true
    }

    return false
}


}
