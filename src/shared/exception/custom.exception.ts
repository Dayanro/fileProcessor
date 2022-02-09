import { ErrorInterface } from '../interface/error.interface';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as debug from 'debug';
import { RpcException } from '@nestjs/microservices';

// Set debug
const log: debug.IDebugger = debug('FileProccesor:exceptions');

export class CustomException extends RpcException {
    constructor(exception: number, values: string[] = []) {
        let resultError: ErrorInterface;
        resultError = {
            statusCode: exception,
            status: HttpStatus[exception],
            values: [],
        };

        resultError.values = resultError.values.concat(values);

        super(
            {
                status: resultError.statusCode,
                message: resultError
            })
    }
}


