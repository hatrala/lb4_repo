import {repository} from '@loopback/repository';
import {BasedModel, User} from '../models';
import {ClassRoomRepository, StudentScoreRepository, UserRepository} from '../repositories';


export class UserService {

  constructor(
    @repository(UserRepository)
    protected userRepository: UserRepository,
    @repository(ClassRoomRepository)
    protected classRoomRepository: ClassRoomRepository,
    @repository(StudentScoreRepository)
    protected studentLessionRepo: StudentScoreRepository
  ) {}

  async createIdArrayFormObjectArray (objectArray: BasedModel[]) {

    const idArray = await Promise.all(
      objectArray.map( async (object) => {

        return {id: object.id}

      })
    )

    return idArray

  }

  async modifiedUserRelationWhenDeactive(userArray: User[], type: string) {

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

    if(type) {

      const userIdArray = await this.createIdArrayFormObjectArray(userArray)

      const fullUserArray = await this.userRepository.find({where: {or: userIdArray}})

      // await this.userRepository.updateAll({status: "Deactive"}, {or: userIdArray})
        await Promise.all([

            this.userRepository.updateAll({status: "Deactive"}, {or: userIdArray}),

            this.modifiedUserRelationWhenDeactive(fullUserArray, type)

        ])

    }

  }


}
