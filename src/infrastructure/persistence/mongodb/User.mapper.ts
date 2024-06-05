import { User as DomainUser } from '../../../domain/user/user.entity';
import { User as MongooseUser } from './schemas/user.schema';

export class UserMapper {
    static toDomain(mongooseUser: MongooseUser): DomainUser {
        const { _id, username, password, todoLists, createdAt, updatedAt } = mongooseUser;
        return new DomainUser(_id.toString(), username, password, todoLists, createdAt, updatedAt);
    }

    static toPersistence(domainUser: DomainUser): Partial<MongooseUser> {
        const { id, username, password, todoLists, createdAt, updatedAt } = domainUser;
        const persistenceData: Partial<MongooseUser> = { username, password, todoLists, createdAt, updatedAt };

        if (id) {
            persistenceData._id = id.toString();
        }

        return persistenceData;
    }
}