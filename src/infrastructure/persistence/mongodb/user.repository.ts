import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRepository } from 'src/domain/user/user.repository.interface';
import { UserMapper } from './user.mapper';
import { User as MongooseUser } from './schemas/user.schema';
import { User as DomainUser } from 'src/domain/user/user.entity';

@Injectable()
export class MongoUserRepository implements UserRepository {
    constructor(@InjectModel(MongooseUser.name) private userModel: Model<MongooseUser>) { }

    async findById(id: string): Promise<DomainUser | null> {
        const userDocument = await this.userModel.findById(id).populate('todoLists').exec();
        if (!userDocument) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        return UserMapper.toDomain(userDocument);
    }

    async findOne(username: string): Promise<DomainUser | null> {
        const userDocument = await this.userModel.findOne({ username }).exec();
        return userDocument ? UserMapper.toDomain(userDocument) : null;
    }

    async findAll(): Promise<DomainUser[]> {
        const userDocuments = await this.userModel.find().populate('todoLists').exec();
        return userDocuments.map(UserMapper.toDomain);
    }

    async create(user: DomainUser): Promise<DomainUser> {
        const userDocument = new this.userModel(UserMapper.toPersistence(user));
        const createdUser = await userDocument.save();
        return UserMapper.toDomain(createdUser);
    }

    async update(id: string, user: Partial<DomainUser>): Promise<DomainUser | null> {
        const updatedUserDocument = await this.userModel.findByIdAndUpdate(id, user, { new: true }).exec();
        return updatedUserDocument ? UserMapper.toDomain(updatedUserDocument) : null;
    }

    async delete(id: string): Promise<void> {
        await this.userModel.findByIdAndDelete(id).exec();
    }
}