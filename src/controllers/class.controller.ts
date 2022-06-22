import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {ClassRoom, User} from '../models';
import {ClassRoomRepository, UserRepository} from '../repositories';
import {ValidateService} from '../services';

export class ClassController {
  constructor(
    @repository(ClassRoomRepository)
    public classRoomRepository : ClassRoomRepository,
    @repository(UserRepository)
    public userRepository : UserRepository,
    @service(ValidateService)
    public validateService: ValidateService
  ) {}

  @post('/create-classroom')
  @response(200, {
    description: 'ClassRoom model instance',
    content: {'application/json': {schema: getModelSchemaRef(ClassRoom)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ClassRoom, {
            title: 'NewClassRoom',
            exclude:
            [
              'id', 'created', 'createdByID',
              'modified', 'modifiedByID', "status"
            ],
          }),
        },
      },
    })
    classRoom: Omit<ClassRoom, 'id'>,
  ): Promise<ClassRoom> {
    await this.validateService.checkDuplicateClass(classRoom)

    return this.classRoomRepository.create(classRoom);

  }

  @del('/class-rooms/{id}')
  @response(204, {
    description: 'ClassRoom DELETE success',
  })
  async deleteById(
    @param.path.string('id') id: string
    ): Promise<void> {

      await this.userRepository.updateAll({status: 'Draft'}, {classRoomId: id})

      await this.classRoomRepository.updateById(id, {status: 'Deactive'});

  }

  @get('/get-all-class-room')
  @response(200, {
    description: 'Array of ClassRoom model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(ClassRoom, {includeRelations: true}),
        },
      },
    },
  })
  async getAllClassRoom(
    // @param.filter(ClassRoom) filter?: Filter<ClassRoom>,
  ): Promise<ClassRoom[]> {
    return this.classRoomRepository.find();
  }

  @post('/addTeacherToClass/{teacherId}/{classId}')
  async addTeachToClass(
    @param.path.string('teacherId') teacherid: string,
    @param.path.string ('classId') classId: string,
  ): Promise<void> {

    const type = "Teacher"

    await Promise.all([

      this.validateService.verifyUserWhenAddToClass(teacherid, type),

      this.validateService.verifyClassWhenAddUserToClass(classId, type)

    ])

    await Promise.all([

      this.userRepository.updateById(teacherid, {
        classRoomId: classId,
        status: 'Active'
      }),

      this.classRoomRepository.updateById(classId, {
        status: "Active"
      })
    ])

    }

  @post('/addStudentToClass/{studentId}/{classId}')
  async addStudentToClass(

  @param.path.string('studentId') studentid: string,
  @param.path.string ('classId') classId: string,

  ): Promise<void> {

    const type = "Student"

    await Promise.all([
      this.validateService.verifyUserWhenAddToClass(studentid, type),
      this.validateService.verifyClassWhenAddUserToClass(classId, type)
    ])

    await this.userRepository.updateById(studentid, {
      classRoomId: classId,
      status: "Active"
    });

    }

  @get('/class-rooms/count')
  @response(200, {
    description: 'ClassRoom model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(ClassRoom) where?: Where<ClassRoom>,
  ): Promise<Count> {
    return this.classRoomRepository.count(where);
  }


  @get('/get-Teacher-info-of-class/{classId}')
    @response(200, {
      description: 'List of student in class',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(User, {includeRelations: true}),
          },
        },
      },
    })
    async findTeacherOfClass(

      @param.path.string ('classId') classId: string,

    ): Promise<User | unknown> {

      try {

        const foundTeacher = await this.userRepository.findOne({
          where: {
            classRoomId: classId,
            type: "Teacher",
            status: 'Active'
          }
        });

        return foundTeacher

      } catch (error) {

        console.log(error);

      }

    }

    @get('/get-list-of-Student-in-class/{classId}')
    @response(200, {
      description: 'List of student in class',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(User, {includeRelations: true}),
          },
        },
      },
    })
    async findStudentInClass(

      @param.path.string ('classId') classId: string,

    ): Promise<User[]> {

      return this.userRepository.find({
        where: {
          classRoomId: classId,
          type: "Student",
          status: 'Active'
        }
      });

    }

    @get('/student/count-in-class/{classId}')
    @response(200, {
      description: 'User model count',
      content: {'application/json': {schema: CountSchema}},
    })
    async countStudent(
      @param.path.string ('classID') classId: string,
    ): Promise<Count> {

      return this.userRepository.count({
        classRoomId: classId,
        status: 'Active'
      });

    }

  @get('/class-rooms/{id}')
  @response(200, {
    description: 'ClassRoom model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(ClassRoom, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(ClassRoom, {exclude: 'where'}) filter?: FilterExcludingWhere<ClassRoom>
  ): Promise<ClassRoom> {
    return this.classRoomRepository.findById(id, filter);
  }

  @patch('/class-rooms/{id}')
  @response(204, {
    description: 'ClassRoom PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ClassRoom, {partial: true}),
        },
      },
    })
    classRoom: ClassRoom,
  ): Promise<void> {
    await this.classRoomRepository.updateById(id, classRoom);
  }

  @put('/class-rooms/{id}')
  @response(204, {
    description: 'ClassRoom PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() classRoom: ClassRoom,
  ): Promise<void> {
    await this.classRoomRepository.replaceById(id, classRoom);
  }


}
