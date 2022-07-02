import { Entity, DefaultCrudRepository} from '@loopback/repository';


export class AuditingRepository<
  T extends Entity,
  ID,
  Relations extends object = {}
> extends DefaultCrudRepository<T, ID, Relations> {
  // put the shared code here
}


