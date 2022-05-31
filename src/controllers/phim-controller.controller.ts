import {
  Count,
  CountSchema,
  Filter,
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
import {Phim} from '../models';
import {PhimRepository} from '../repositories';

export class PhimControllerController {
  constructor(
    @repository(PhimRepository)
    public phimRepository : PhimRepository,
  ) {}

  @post('/Phim/ThemPhim')
  @response(200, {
    description: 'Phim model instance',
    content: {'application/json': {schema: getModelSchemaRef(Phim)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Phim, {
            title: 'NewPhim',

          }),
        },
      },
    })
    phim: Phim,
  ): Promise<Phim> {
    return this.phimRepository.create(phim);
  }

  @get('/Phim/count')
  @response(200, {
    description: 'Phim model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Phim) where?: Where<Phim>,
  ): Promise<Count> {
    return this.phimRepository.count(where);
  }

  @get('/Phim')
  @response(200, {
    description: 'Array of Phim model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Phim, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Phim) filter?: Filter<Phim>,
  ): Promise<Phim[]> {
    return this.phimRepository.find(filter);
  }

  @patch('/Phim')
  @response(200, {
    description: 'Phim PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Phim, {partial: true}),
        },
      },
    })
    phim: Phim,
    @param.where(Phim) where?: Where<Phim>,
  ): Promise<Count> {
    return this.phimRepository.updateAll(phim, where);
  }

  @get('/Phim/{id}')
  @response(200, {
    description: 'Phim model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Phim, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Phim, {exclude: 'where'}) filter?: FilterExcludingWhere<Phim>
  ): Promise<Phim> {
    return this.phimRepository.findById(id, filter);
  }

  @patch('/Phim/{id}')
  @response(204, {
    description: 'Phim PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Phim, {partial: true}),
        },
      },
    })
    phim: Phim,
  ): Promise<void> {
    await this.phimRepository.updateById(id, phim);
  }

  @put('/Phim/{id}')
  @response(204, {
    description: 'Phim PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() phim: Phim,
  ): Promise<void> {
    await this.phimRepository.replaceById(id, phim);
  }

  @del('/Phim/{id}')
  @response(204, {
    description: 'Phim DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.phimRepository.deleteById(id);
  }
}
