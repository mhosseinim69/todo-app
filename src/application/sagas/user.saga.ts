import { Injectable } from '@nestjs/common';
import { Saga, ofType } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { UserCreatedEvent, UserUpdatedEvent, UserDeletedEvent } from '../../domain/events/user-events';
import { WinstonLogger } from '../../application/logger/winston-logger.service';

@Injectable()
export class UserSagas {
    constructor(private readonly logger: WinstonLogger) { }

    @Saga()
    userCreated = (events$: Observable<any>): Observable<void> => {
        return events$.pipe(
            ofType(UserCreatedEvent),
            delay(1000),
            map(event => {
                this.logger.log(`User created: ${event.userId}, ${event.username}`);
            }),
        );
    };

    @Saga()
    userUpdated = (events$: Observable<any>): Observable<void> => {
        return events$.pipe(
            ofType(UserUpdatedEvent),
            delay(1000),
            map(event => {
                this.logger.log(`User updated: ${event.userId}`);
            }),
        );
    };

    @Saga()
    userDeleted = (events$: Observable<any>): Observable<void> => {
        return events$.pipe(
            ofType(UserDeletedEvent),
            delay(1000),
            map(event => {
                this.logger.log(`User deleted: ${event.userId}`);
            }),
        );
    };
}