import {service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {activedStatus, deletedStatus, draftStatus} from '../config';
import {BasedModel, User} from '../models';
import {
  ClassRoomRepository,
  LessionRepository,
  StudentScoreRepository,
  UserRepository,
} from '../repositories';
import {NonDbService} from './NonDB.service';
import {ValidateService} from './validate.service';

export class UserService {
  constructor(
    @repository(UserRepository)
    protected userRepository: UserRepository,
    @repository(ClassRoomRepository)
    protected classRoomRepository: ClassRoomRepository,
    @repository(LessionRepository)
    protected lessionRepository: LessionRepository,
    @repository(StudentScoreRepository)
    protected studentLessionRepo: StudentScoreRepository,

    @service(NonDbService)
    public nonDbService: NonDbService,
    @service(ValidateService)
    public validService: ValidateService,
  ) {}

  async createIdArrayFormObjectArray(objectArray: BasedModel[]) {
    const idArray = await Promise.all(
      objectArray.map(async object => {
        return {id: object.id};
      }),
    );

    return idArray;
  }

  async createIdArrayFromStringArray(stringArray: Array<string>) {
    const idArray = await Promise.all(
      stringArray.map(async element => {
        return {id: element};
      }),
    );

    return idArray;
  }

  async modifiedUserRelationWhenDeactive(userArray: User[], type: string) {
    if (type === 'Teacher') {
      const classIdArray = await Promise.all(
        userArray
          .filter(async user => {
            if (user.classRoomId && user.status === activedStatus) {
              return true;
            }
            return false;
          })
          .map(async user => {
            return {
              id: user.classRoomId,
            };
          }),
      );

      await this.classRoomRepository.updateAll(
        {status: draftStatus},
        {or: classIdArray},
      );
    }

    if (type === 'Student') {
      const studentLessionFilterArray = await Promise.all(
        userArray
          .filter(async user => {
            if (user.classRoomId && user.status === activedStatus) {
              return true;
            }
            return false;
          })
          .map(async user => {
            return {
              studentId: user.id,
            };
          }),
      );

      await this.studentLessionRepo.updateAll(
        {status: draftStatus},
        {or: studentLessionFilterArray},
      );
    }
  }

  async deActiveUser(userArray: User[], type: string) {
    if (type) {
      const userIdArray = await this.createIdArrayFormObjectArray(userArray);

      const fullUserArray = await this.userRepository.find({
        where: {or: userIdArray},
      });

      // await this.userRepository.updateAll({status: "Deactive"}, {or: userIdArray})
      await Promise.all([
        this.userRepository.updateAll(
          {status: deletedStatus},
          {or: userIdArray},
        ),

        this.modifiedUserRelationWhenDeactive(fullUserArray, type),
      ]);
    }
  }

  async changePassword(newpassword: string): Promise<void> {
    const newHashPassword = await this.nonDbService.hashPassword(newpassword);

    await this.userRepository.updateById(
      (
        await this.validService.headerTokenDecode()
      ).id,

      {password: newHashPassword},
    );
  }

  async getStudentScore(studentId: string): Promise<Array<Object>> {
    const scoreListWithLessionId = await this.studentLessionRepo.find({
      where: {
        studentId: studentId,
      },
    });

    const studentScore = await Promise.all(
      scoreListWithLessionId.map(async scoreOject => {
        const lessionName = (
          await this.lessionRepository.findById(scoreOject.lessionId)
        ).lessionName;
        return {
          lessionName: lessionName,
          score: scoreOject.score,
        };
      }),
    );

    return studentScore;
  }
}
