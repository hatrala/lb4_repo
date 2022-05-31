import {Entity, model, property} from '@loopback/repository';

@model()
export class Phim extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
  })
  maPhim?: number;

  @property({
    type: 'string',
  })
  tenPhim?: string;

  @property({
    type: 'string',
  })
  moTa?: string;

  @property({
    type: 'string',
  })
  trailer?: string;

  @property({
    type: 'string',
  })
  hinhAnh?: string;

  @property({
    type: 'date',
  })
  ngayKhoiChieu?: string;

  @property({
    type: 'number',
  })
  dangGia?: number;

  @property({
    type: 'boolean',
  })
  sapChieu?: boolean;

  @property({
    type: 'boolean',
  })
  dangChieu?: boolean;

  @property({
    type: 'boolean',
  })
  hot?: boolean;


  constructor(data?: Partial<Phim>) {
    super(data);
  }
}

export interface PhimRelations {
  // describe navigational properties here
}

export type PhimWithRelations = Phim & PhimRelations;
