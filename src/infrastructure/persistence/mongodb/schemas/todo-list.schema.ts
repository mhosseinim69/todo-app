import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TodoItem } from 'src/domain/todo-item/todo-item.entity';

@Schema()
export class TodoListDocument extends Document {
    @Prop()
    userId: string;

    @Prop()
    title: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'TodoItem' }] })
    todoItems: TodoItem[];

    @Prop({ default: Date.now })
    createdAt: Date;

    @Prop({ default: Date.now })
    updatedAt: Date;
}

export const TodoListSchema = SchemaFactory.createForClass(TodoListDocument);