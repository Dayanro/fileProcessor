import * as debug from 'debug';
import { CustomException } from '../exception/custom.exception';
const fs = require("fs");
const path = require('path')

const log: debug.IDebugger = debug('fileprocessor:files:utils');


export function createPath(workDirectory: string, directoryName: string, dirname: string): string {
    return path.join(workDirectory, dirname, directoryName);
}

export function createDirectory(path: string): void {
    fs.access(path, (error) => {
        if (error) {
            fs.mkdir(path, { recursive: true }, (error) => {
                if (error) { throw new CustomException(400, ['The directory could not be created']); }
                else { log('New Directory created successfully!'); }
            });
        } else {
            log('Given Directory already exists');
        }
    });
}

export function moveFile(file: string, directory: string): void {
    const filename = path.basename(file);
    const destination = path.resolve(directory, filename);
    fs.rename(file, destination, (error) => {
        if (error) {
            log(error)
        }
        else { log('Successfully moved'); }
    });
};


