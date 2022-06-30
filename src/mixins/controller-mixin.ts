import {MixinTarget} from '@loopback/core';
import { Entity, Where} from '@loopback/repository';
import {Based} from './mixin-interface';
import {param, get, getModelSchemaRef, HttpErrors, patch, requestBody, del, post} from '@loopback/rest';

/**
 * Options to mix in findByTitle
 */
export interface ControllerMixinOptions {
  /**
   * Base path for the controller
   */
  basePath: string;
  /**
   * Model class for CRUD
   */
  modelClass: typeof Entity;

}

/**
 * A mixin factory for controllers to be extended by `FindByTitle`
 * @param superClass - Base class
 * @param options - Options for the controller
 *
 * @typeParam M - Model class
 * @typeParam T - Base class
 */

export function ControllerMixin<
  M extends Entity,
  T extends MixinTarget<object>,
>(superClass: T, options: ControllerMixinOptions) {
  class MixedController extends superClass implements Based<M> {
    // Value will be provided by the subclassed controller class
    mainRepo: Based<M>;
    mainService: Based<M>;

    @get(`/${options.basePath}/find`, {
      responses: {
        '200': {
          description: `Array of ${options.modelClass.modelName} model instances`,
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: getModelSchemaRef(options.modelClass, {
                  includeRelations: true,
                }),
              },
            },
          },
        },
      },
    })
    async findByFilter(
      @param.query.object('filter') filter: Where<M>
    ): Promise<M[]> {
      try {
        return await this.mainRepo.findByFilter(filter);
      } catch (error) {
        throw new HttpErrors.NotAcceptable(`${error}`)
      }

    }

    @patch(`/${options.basePath}/update/{${options.basePath}Id}`)
    async updateOne(
      @param.path.string(`${options.basePath}Id`) id: string,
      @requestBody({
        content: {
          'application/json': {
            schema: {
              items: getModelSchemaRef(Object,
                {
                  exclude: []
                },
              ),
            },
          },
        },
      })
      updateData: Object
    ): Promise<void> {
      try {
        await this.mainRepo.updateOne(id, updateData);
      } catch (error) {
        throw new HttpErrors.NotAcceptable(`${error}`)
      }

    }

    @del(`/${options.basePath}`)
    async deleteByFilter(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              items: getModelSchemaRef(Object,
                {
                  exclude: []
                },
              ),
            },
          },
        },
      })
      filter: Where<M>
    ): Promise<void> {
      try {
         await this.mainRepo.deleteByFilter(filter);
      } catch (error) {
        throw new HttpErrors.NotAcceptable(`${error}`)
      }

    }

    @post(`/${options.basePath}/create`)
    async createOne(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              items: getModelSchemaRef(options.modelClass,
                {
                  exclude: []
                },
              ),
            },
          },
        },
      })
      object: M
    ): Promise<M> {
      try {
        return await this.mainRepo.createOne(object);
      } catch (error) {
        throw new HttpErrors.NotAcceptable(`${error}`)
      }
    }
    
  }

  return MixedController;
}
