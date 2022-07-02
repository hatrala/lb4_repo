import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {inject, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors, Request, RestBindings, SchemaObject} from '@loopback/rest';
// import bcrypt from 'bcryptjs'
import bcrypt from 'bcryptjs';

// import {setTimeout} from 'timers';
import {
  ClassRoom,
  ClassRoomRelations,
  Lession,
  StudentScore,
  User,
} from '../models';
import {
  ClassRoomRepository,
  LessionRepository,
  StudentScoreRepository,
  UserRepository,
} from '../repositories';

import {promisify} from 'util';
import {activedStatus, draftStatus, teacherType} from '../config';
import {NonDbService} from './NonDB.service';
const jwt = require('jsonwebtoken');
const verifyAsync = promisify(jwt.verify);

export declare type TokenObject = {
  id: string;
  useremail: string;
  username: string;
  classid: string;
  type: string;
  iat: number;
  exp: number;
};

const userUpdateData: SchemaObject = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
    },
    email: {
      type: 'string',
    },
    gender: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    age: {
      type: 'number',
    },
  },
};

export class ValidateService {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SECRET)
    private jwtSecret: string,
    @inject(RestBindings.Http.REQUEST)
    private req: Request,

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
  ) {}

  async verifyLoginInformation(requestUser: User): Promise<void> {
    const exitedUser = await this.userRepository.findOne({
      where: {email: requestUser.email},
    });

    if (!exitedUser) {
      throw new HttpErrors[404]('User not exited');
    }

    const hashPassword = exitedUser.password.toString();

    const checkPass = await this.comparePassword(
      requestUser.password,
      hashPassword,
    );

    if (!checkPass) {
      throw new HttpErrors.NotAcceptable('password is wrong');
    }
  }

  async comparePassword(
    requestpassword: string,
    hashPassword: string,
  ): Promise<boolean> {
    const isMatch = await bcrypt.compare(requestpassword, hashPassword);

    return isMatch;
  }

  async generateToken(requestUser: User): Promise<String> {
    const foundUser = await this.userRepository.findOne({
      where: {email: requestUser.email},
    });

    const email = foundUser?.email.toString();
    const username = foundUser?.username.toString();
    const id = foundUser?.id;
    const usertype = foundUser?.type;
    const classid = foundUser?.classRoomId;

    const token = jwt.sign(
      {
        id: id,
        useremail: email,
        username: username,
        classid: classid,
        type: usertype,
      },
      // 'superSecretKey',
      this.jwtSecret,
      {expiresIn: '1h'},
    );
    return token;
  }

  async isExitedUserName(userName: string): Promise<boolean> {
    const isExited = await this.userRepository.findOne({
      where: {
        username: userName,
      },
    });
    // console.log(isExited != null);

    return isExited != null;
  }

  async isExitedEmail(email: string): Promise<boolean> {
    const isExited = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
    console.log(isExited);

    return isExited != null;
  }

  async checkDuplicateUser(newUser: User): Promise<void> {
    await Promise.all([
      this.isExitedUserName(newUser.username),
      this.isExitedEmail(newUser.email),
    ]).then(result => {
      if (result[0] === true || result[1] === true) {
        throw new HttpErrors.NotAcceptable('User Exited');
      }
    });
  }

  async checkDuplicateUserWhenUpdate(
    updateUser: typeof userUpdateData | User,
  ): Promise<void> {
    const isDuplicate = await this.isExitedUserName(updateUser.username);

    if (isDuplicate) {
      throw new HttpErrors.NotAcceptable('User Exited');
    }
  }

  async checkDuplicateClass(classRoom: ClassRoom): Promise<void> {
    const isDuplicate = await this.classRoomRepository.findOne({
      where: {
        className: classRoom.className,
      },
    });

    if (isDuplicate) {
      throw new HttpErrors.NotAcceptable(
        `this class: ${classRoom.className} is already exited `,
      );
    }
  }

  async checkExitedUser(id: string, type: string): Promise<void> {
    const isExitedUser = await this.userRepository.findOne({
      where: {id: id, type: type},
    });

    if (!isExitedUser) {
      throw new HttpErrors.NotAcceptable(`${type} not exist`);
    }
  }

  async verifyUserWhenAddToClass(
    userid: string,
    usertype: string,
  ): Promise<void> {
    const isExitedUser = await this.userRepository.findOne({
      where: {
        id: userid,
        type: usertype,
        status: draftStatus,
      },
    });
    console.log(isExitedUser);

    if (!isExitedUser || isExitedUser.classRoomId) {
      throw new HttpErrors[401](
        `${usertype} not exist or not ready to add to class`,
      );
    }
    // else if(isExitedUser.classRoomId) {

    //   throw new HttpErrors.NotAcceptable(`This ${usertype} already belong to another class`)

    // }
  }

  async checkExistedClass(classid: string, usertype?: string): Promise<void> {
    if (usertype === 'Teacher') {
      const isExitedClass = await this.classRoomRepository.findOne({
        where: {id: classid, status: draftStatus},
      });

      if (!isExitedClass) {
        throw new HttpErrors.NotAcceptable(
          `There is no class match requirement`,
        );
      }
    } else {
      const isExitedClass = await this.classRoomRepository.findOne({
        where: {
          and: [
            {id: classid},
            {or: [{status: draftStatus}, {status: activedStatus}]},
          ],
        },
      });

      if (!isExitedClass) {
        throw new HttpErrors.NotAcceptable(
          `There is no class match requirement `,
        );
      }
    }
  }

  async checkIfClassHasTeacher(classid: string): Promise<void> {
    const foundUser = await this.userRepository.find({
      where: {
        and: [{classRoomId: classid}, {status: activedStatus}],
      },
    });

    if (foundUser.length > 0) {
      throw new HttpErrors.NotAcceptable('This class is already has a teacher');
    }
  }

  async verifyClassWhenAddUserToClass(
    classid: string,
    usertype: string,
  ): Promise<void> {
    if (usertype === 'Student') {
      await this.checkExistedClass(classid, usertype);
    } else {
      await Promise.all([
        this.checkExistedClass(classid, usertype),
        this.checkIfClassHasTeacher(classid),
      ]);
    }
  }

  async checkUserType(usertype: string): Promise<boolean> {
    const user = await this.headerTokenDecode();

    if (user.type === usertype) {
      return true;
    }

    return false;
  }

  async headerTokenDecode(): Promise<TokenObject> {
    const token = this.req.headers.authorization!.split(' ')[1];

    const decode = await verifyAsync(token, this.jwtSecret);

    console.log(decode);

    return decode;
  }

  async checkUserTypeByHeaderToken(type: string): Promise<boolean> {
    const user = await this.headerTokenDecode();
    return user.type === type;
  }

  async checkIsTeacher(): Promise<boolean> {
    const isTeacher = await this.checkUserTypeByHeaderToken(teacherType);
    return isTeacher;
  }

  // async checkDuplicateUserName(username: string): Promise<boolean> {
  //   const foundUser = await this.userRepository.findOne({where: {username: username}})

  // }

  async verifyUserWhenCreate(user: User): Promise<void> {
    await this.nonDbService.verifyPassword(user.password);

    await this.nonDbService.verifyEmailAndPassWord(user);

    // await this.checkDuplicateUser(user)
  }

  async verifyUserWhenLogin(user: User): Promise<void> {
    await this.nonDbService.verifyPassword(user.password);

    await this.nonDbService.verifyEmailAndPassWord(user);

    await this.verifyLoginInformation(user);
  }

  async verifyOldPasswordBeforeChangePassword(
    newpassword: string,
  ): Promise<void> {
    const userinfo = await this.headerTokenDecode();

    const foundUser = await this.userRepository.findById(userinfo.id);

    const isMatch = await this.comparePassword(newpassword, foundUser.password);

    if (!isMatch) {
      throw new HttpErrors.NotAcceptable('OldPassword is wrong');
    }
  }

  async fillClassHasEnoughStudents(
    classArray: ((ClassRoom & ClassRoomRelations) | undefined)[],
    numberOfStudent: number,
  ): Promise<((ClassRoom & ClassRoomRelations) | undefined)[]> {
    let classMatchCondition = await Promise.all(
      classArray.map(async classroom => {
        const number = await this.userRepository.count({
          type: 'Student',
          classRoomId: classroom!.id,
        });

        if (number.count >= numberOfStudent) {
          return classroom;
        }
      }),
    );

    classMatchCondition =
      await this.nonDbService.deleteNullElementFromClassArray(
        classMatchCondition,
      );

    return classMatchCondition;
  }

  async authorizeTeacher(): Promise<void> {
    const isTeacher = await this.checkIsTeacher();
    if (!isTeacher) {
      throw new HttpErrors[401]();
    }
  }

  async authorizeWhenUpdateScore(scoreId: string): Promise<void> {
    await this.authorizeTeacher();

    const foundScore = await this.studentLessionRepo.findById(scoreId);
    await this.verifyTeacherAndStudentRelation(foundScore.studentId);
  }

  async verifyTeacherAndStudentRelation(studentId: string): Promise<void> {
    const teacher = await this.headerTokenDecode();
    const student = await this.userRepository.findById(studentId);
    const studentClassRoomId = student.classRoomId
    if (teacher.classid != studentClassRoomId) {
      throw new HttpErrors[401]();
    }
  }

  async authorizeWhenGetScore(studentId: string): Promise<void> {
    const user = await this.headerTokenDecode();

    if (!(user.type === 'teacher' || user.id === studentId)) {
      throw new HttpErrors[401]();
    }
  }

  async checkDuplicateLession(lession: Lession) {
    const isExited = await this.lessionRepository.findOne({
      where: {
        lessionName: lession.lessionName,
      },
    });

    if (isExited) {
      throw new HttpErrors[403]();
    }
  }

  async checkExitedLessionById(id: string): Promise<void> {
    const isExited = await this.lessionRepository.findById(id);

    if (!isExited) {
      throw new HttpErrors[404]('Lession not exist');
    }
  }

  async checkDuplicateStudentScore(studentScore: StudentScore) {
    const isExitedStudentScore = await this.studentLessionRepo.findOne({
      where: {
        studentId: studentScore.studentId,
        lessionId: studentScore.lessionId,
      },
    });

    if (isExitedStudentScore) {
      throw new HttpErrors[403]('Duplicate studentScore');
    }
  }
}
