import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, Logger } from 'winston';
import { winstonConfig } from './winston-config';

@Injectable()
export class WinstonLogger implements LoggerService {
    private readonly logger: Logger;

    constructor() {
        this.logger = createLogger(winstonConfig);
    }

    log(message: string) {
        this.logger.info(message);
    }

    error(message: string, trace: string) {
        this.logger.error(`${message} - ${trace}`);
    }

    warn(message: string) {
        this.logger.warn(message);
    }

    debug(message: string) {
        this.logger.debug(message);
    }

    verbose(message: string) {
        this.logger.verbose(message);
    }
}