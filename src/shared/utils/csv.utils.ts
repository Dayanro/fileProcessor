const csv = require('csv-parser');
const fs = require('fs');
import * as debug from 'debug';
import { moduleConfig } from 'src/app/modules/files/files.config';
import { FileInfoInterface } from '../interface/fileInfo.interface';
import {
  FileChanges,
  MetadataInterface,
} from '../interface/metadata.interface';
const stream = require('event-stream');

const log: debug.IDebugger = debug('fileprocessor:csv:utils');

export async function parseCSV(filepath: any, option?: {}): Promise<any[]> {
  const results: any[] = [];
  return new Promise<any[]>((resolve, reject) => {
    fs.createReadStream(filepath)
      .pipe(csv(option))
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      });
  });
}

export async function getFileData(
  filepath: string,
): Promise<MetadataInterface> {
  const stat: any = await getFileInfo(filepath);
  const size = stat.size;
  const data: any[] = await structureData(filepath);
  const linesNumber: number = data.length + 1;
  const headerList: string[] = Object.keys(data[0]);
  return { size, linesNumber, headerList };
}

export async function transformCSV(
  filepath: any,
  newFilepath: any,
): Promise<FileInfoInterface> {
  return new Promise<FileInfoInterface>((resolve, reject) => {
    let isHeader = true;
    const fileChanges = [];
    const newCsv = fs.createWriteStream(newFilepath);
    fs.createReadStream(filepath)
      .pipe(stream.split(/(\r?\n)/))
      .pipe(
        stream.mapSync(function (data) {
          if (isHeader) {
            const oldValue = data.split(';');
            data = data.toUpperCase();
            const newValue = data.split(';');
            const setValues: FileChanges = {
              type: moduleConfig.defaults.modificationsType.upperCase,
              oldValue,
              newValue,
            };
            fileChanges.push(setValues);
            isHeader = false;
          }
          newCsv.write(data);
        }),
      )
      .on('end', () => {
        resolve({ filepath, destination: newFilepath, fileChanges });
      });
  });
}

export async function fileIsValid(filepath: string): Promise<boolean> {
  let isValid = true;
  const data = await structureData(filepath);
  data.forEach((datum) => {
    const headers = Object.keys(datum);
    for (const header of headers) {
      if (datum[header] === '' || header === '') {
        isValid = false;
        break;
      }
    }
  });
  return isValid;
}

export async function structureData(filepath: string): Promise<any> {
  const option = { separator: ';' };
  const data = await parseCSV(filepath, option);
  return data;
}

export async function readCSV(filepath: string): Promise<any> {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(
      filepath,
      (error: NodeJS.ErrnoException | null, data: Buffer) => {
        if (error) {
          reject(error);
        } else {
          resolve(data.toString());
        }
      },
    );
  });
}

export async function getFileInfo(filepath: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    fs.stat(filepath, (error, stats) => {
      if (error) {
        console.log(error);
      } else {
        resolve(stats);
      }
    });
  });
}
