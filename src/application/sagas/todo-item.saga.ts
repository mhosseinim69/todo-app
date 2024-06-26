import { Injectable } from '@nestjs/common';
import { Saga, ofType } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { TodoItemCreatedEvent, TodoItemUpdatedEvent, TodoItemDeletedEvent } from '../../domain/events/todo-item-events';
import { WinstonLogger } from '../../application/logger/winston-logger.service';

@Injectable()
export class TodoItemSagas {
    constructor(private readonly logger: WinstonLogger) { }

    @Saga()
    todoItemCreated = (events$: Observable<any>): Observable<void> => {
        return events$.pipe(
            ofType(TodoItemCreatedEvent),
            delay(1000),
            map(event => {
                this.logger.log(`Todo item created: ${event.todoItemId}, ${event.todoListId}`);
            }),
        );
    };

    @Saga()
    todoItemUpdated = (events$: Observable<any>): Observable<void> => {
        return events$.pipe(
            ofType(TodoItemUpdatedEvent),
            delay(1000),
            map(event => {
                this.logger.log(`Todo item updated: ${event.todoItemId}`);
            }),
        );
    };

    @Saga()
    todoItemDeleted = (events$: Observable<any>): Observable<void> => {
        return events$.pipe(
            ofType(TodoItemDeletedEvent),
            delay(1000),
            map(event => {
                this.logger.log(`Todo item deleted: ${event.todoItemId}`);
            }),
        );
    };
}