import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class TodoItemDocument extends Document {
    @Prop()
    todoListId: string;

    @Prop()
    title: string;

    @Prop()
    description: string;

    @Prop()
    priority: number;

    @Prop({ default: Date.now })
    createdAt: Date;

    @Prop({ default: Date.now })
    updatedAt: Date;
}

export const TodoItemSchema = SchemaFactory.createForClass(TodoItemDocument);