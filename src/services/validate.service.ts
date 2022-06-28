import { repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
// import bcrypt from 'bcryptjs'
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
// import {setTimeout} from 'timers';
import {BasedModel, ClassRoom, User} from '../models';
import {ClassRoomRepository, StudentScoreRepository, UserRepository} from '../repositories';
export class ValidateService {
  constructor(
    @repository(UserRepository)
    protected userRepository: UserRepository,
    @repository(ClassRoomRepository)
    protected classRoomRepository: ClassRoomRepository,
    @repository(StudentScoreRepository)
    protected studentLessionRepo: StudentScoreRepository
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

 async checkExitedUser (id: string, type: string):Promise<void> {

  const isExitedUser = await this.userRepository.findOne({where: {id: id, type: type}})

  if(!isExitedUser) {

   throw new HttpErrors.NotAcceptable(`${type} not exist`)

  }
}

async verifyUserWhenAddToClass (userid: string, usertype: string): Promise<void> {

  const isExitedUser = await this.userRepository.findOne({
    where: {
      id: userid,
      type: usertype,
      status: 'Draft'
    }
  })
  console.log(isExitedUser);

  if(!isExitedUser) {

    throw new HttpErrors.NotAcceptable(`${usertype} not exist or not ready to add to class`)

  }
  // else if(isExitedUser.classRoomId) {

  //   throw new HttpErrors.NotAcceptable(`This ${usertype} already belong to another class`)

  // }

}

async checkExistedClass (classid: string, usertype?: string): Promise<void> {

    if(usertype === "Teacher") {

      const isExitedClass = await this.classRoomRepository.findOne({where: {id: classid, status: 'Draft'}})

      if(!isExitedClass) {

        throw new HttpErrors.NotAcceptable(`There is no class match requirement`)

      }

    }else {
      const isExitedClass = await this.classRoomRepository.findOne({
        where:
        {
          and: [
            {id: classid},
            {or: [
              {status: 'Draft'},
              {status: 'Active'}
            ]}
          ]
        }
      })

      if(!isExitedClass) {

        throw new HttpErrors.NotAcceptable(`There is no class match requirement `)

      }
    }

}

async checkIfClassHasTeacher(classid: string): Promise<void> {
  const foundUser = await this.userRepository.find({
    where: {
      and: [{classRoomId: classid},
      {status: 'Active'}]
    }
  })

  if(foundUser.length > 0) {

    throw new HttpErrors.NotAcceptable("This class is already has a teacher")

  }
}

async verifyClassWhenAddUserToClass (classid: string, usertype: string): Promise<void> {

  if(usertype === "Student") {

      await this.checkExistedClass(classid, usertype)

  }else {

    await Promise.all([
      this.checkExistedClass(classid, usertype),
      this.checkIfClassHasTeacher(classid)
    ])

  }

}

async checkUserType (user: User, usertype: string): Promise<boolean> {

  if(user.type !== usertype) {

    return false

  }

  return true

}

async createIdArrayFormObjectArray (objectArray: BasedModel[]) {

  const idArray = await Promise.all(
    objectArray.map( async (object) => {

      return {id: object.id}

    })
  )

  return idArray

}

async modifiedUserRelationWhenDeactive(userArray: User[], type: string) {

// Function nay em chua hoan thien hien chi su dung cho viec deactive teacher

  // const fullUserArray = await Promise.all(
  //   userIdArray.map( async (emlements) => {

  //     const fulluser = await this.userRepository.findById(emlements.id)

  //     return fulluser

  //   })
  // )

    if(type === "Teacher") {
      const classIdArray = await Promise.all(
      userArray.filter(async (user) => {

        if(user.classRoomId && user.status === "Active") {

          return true

        }
        return false

      }).map( async (user) => {

        return {

          id: user.classRoomId

        }

      })
    )

    await this.classRoomRepository.updateAll({status: "Draft"}, {or: classIdArray})
  }

  if(type === "Student") {

    const studentLessionFilterArray = await Promise.all(
    userArray.filter(async (user) => {

      if(user.classRoomId && user.status === "Active") {

        return true

      }
      return false

    }).map( async (user) => {

      return {

        studentID: user.id

      }

    })
  )

  await this.studentLessionRepo.updateAll({status: "Draft"}, {or: studentLessionFilterArray})

}


}

async deActiveUser (userArray: User[], type: string) {

  if(type === "Teacher") {

    const userIdArray = await this.createIdArrayFormObjectArray(userArray)

    const fullUserArray = await this.userRepository.find({where: {or: userIdArray}})

    // await this.userRepository.updateAll({status: "Deactive"}, {or: userIdArray})
      await Promise.all([

          this.userRepository.updateAll({status: "Deactive"}, {or: userIdArray}),

          this.modifiedUserRelationWhenDeactive(fullUserArray, type)

      ])

  }

  if(type === "Student") {

    const userIdArray = await this.createIdArrayFormObjectArray(userArray)

    const fullUserArray = await this.userRepository.find({where: {or: userIdArray}})

    await Promise.all([

      this.userRepository.updateAll({status: "Deactive"}, {or: userIdArray}),

      this.modifiedUserRelationWhenDeactive(fullUserArray, type)

  ])

  }

}


}
