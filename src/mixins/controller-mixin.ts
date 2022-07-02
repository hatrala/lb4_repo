/* eslint-disable @typescript-eslint/no-invalid-this */
import {MixinTarget} from '@loopback/core';
import { Entity, Where} from '@loopback/repository';
import {param, get, getModelSchemaRef, HttpErrors, patch, requestBody, del, post} from '@loopback/rest';
import {AuditingRepository} from './repository-mixin';


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
  R extends AuditingRepository<M, string>
>(superClass: T, options: ControllerMixinOptions) {
  class MixedController extends superClass {
    // Value will be provided by the subclassed controller class
    mainRepo: R;

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
    async find(
      @param.query.object('filter', Object) filter: Where<M>
    ): Promise<M[]> {
      try {
        return await this.mainRepo.find({where: filter});
      } catch (error) {
        throw new HttpErrors[404](`${error}`)
      }

    }

    @patch(`/${options.basePath}/update/{id}`)
    async updateOne(
      @param.path.string(`id`) id: string,
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
        await this.mainRepo.updateById(id, updateData);
      } catch (error) {
        throw new HttpErrors.NotAcceptable(`${error}`)
      }

    }

    @del(`/${options.basePath}/{id}`)
    async deleteByFilter(
      @param.path.string(`id`) id: string,
    ): Promise<void> {
      try {
         await this.mainRepo.deleteById(id);
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
        return await this.mainRepo.create(object);
      } catch (error) {
        throw new HttpErrors.NotAcceptable(`${error}`)
      }
    }

  }

  return MixedController;
}



