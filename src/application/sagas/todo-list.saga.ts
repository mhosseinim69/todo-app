import { Injectable } from '@nestjs/common';
import { Saga, ofType } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { TodoListCreatedEvent, TodoListUpdatedEvent, TodoListDeletedEvent } from '../../domain/events/todo-list-events';
import { WinstonLogger } from '../../application/logger/winston-logger.service';

@Injectable()
export class TodoListSagas {
    constructor(private readonly logger: WinstonLogger) { }

    @Saga()
    todoListCreated = (events$: Observable<any>): Observable<void> => {
        return events$.pipe(
            ofType(TodoListCreatedEvent),
            delay(1000),
            map(event => {
                this.logger.log(`Todo list created: ${event.todoListId}, ${event.userId}`);
            }),
        );
    };

    @Saga()
    todoListUpdated = (events$: Observable<any>): Observable<void> => {
        return events$.pipe(
            ofType(TodoListUpdatedEvent),
            delay(1000),
            map(event => {
                this.logger.log(`Todo list updated: ${event.todoListId}`);
            }),
        );
    };

    @Saga()
    todoListDeleted = (events$: Observable<any>): Observable<void> => {
        return events$.pipe(
            ofType(TodoListDeletedEvent),
            delay(1000),
            map(event => {
                this.logger.log(`Todo list deleted: ${event.todoListId}`);
            }),
        );
    };
}