import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TodoList } from 'src/domain/todo-list/todo-list.entity';

@Schema()
export class User extends Document {
    @Prop()
    username: string;

    @Prop()
    password: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'TodoList' }] })
    todoLists: TodoList[];

    @Prop({ default: Date.now })
    createdAt: Date;

    @Prop({ default: Date.now })
    updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);