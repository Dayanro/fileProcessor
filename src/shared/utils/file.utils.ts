import * as debug from 'debug';
import { FileInfoInterface } from '../interface/fileInfo.interface';
const fs = require('fs');
const path = require('path');

const log: debug.IDebugger = debug('fileprocessor:files:utils');

export function createPath(
  workDirectory: string,
  directoryName: string,
  dirname: string,
  dirId?: string,
): string {
  return path.join(workDirectory, dirname, directoryName, dirId);
}

export async function createDirectory(path: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    fs.access(path, (error) => {
      if (error) {
        fs.mkdir(path, { recursive: true }, (error) => {
          if (error) {
            reject(error);
          }
          else {
            log('New Directory created successfully!');
            resolve(true);
          }
        });
      } else {
        log('Given Directory already exists');
        resolve(true);
      }
    });
  });
}

export async function moveFile(
  file: string,
  directory: string,
  id?: string,
): Promise<FileInfoInterface> {
  let filename = path.basename(file);
  if (id) {
    const nameSplit = filename.split('.');
    filename = `${nameSplit[0]}.${id}.csv`;
  }
  const destination = path.resolve(directory, filename);

  return new Promise<FileInfoInterface>((resolve, reject) => {
    fs.rename(file, destination, (error) => {
      if (error) {
        reject(error);
      } else {
        log('Successfully moved');
        resolve({ destination, filename });
      }
    });
  });
}
