import { User } from './user.entity';

export interface UserRepository {
    findById(id: string): Promise<User | null>;
    findOne(username: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    create(user: User): Promise<User>;
    update(id: string, user: Partial<User>): Promise<User | null>;
    delete(id: string): Promise<void>;
}