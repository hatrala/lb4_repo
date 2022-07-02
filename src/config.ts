import {SchemaObject} from '@loopback/rest'


export const teacherType = "teacher"
export const studentType = "student"


export const draftStatus = "draft"
export const activedStatus = "actived"
export const deletedStatus = "deleted"

export const ChangePasswordSchema: SchemaObject = {
  type: 'object',
  required: ['oldpassword', 'newpassword'],
  properties: {
    oldpassword: {
      type: 'string',
    },
    newpassword: {
      type: 'string',
    },
  },
};

export const userUpdateData: SchemaObject = {
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
      type: "number",
    },
  },
};

export const UserFilter: SchemaObject = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
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
    type: {
      type: 'string',
    },
    age: {
      type: "number",
    },
  },
};



