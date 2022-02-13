const csv = require('csv-parser');
const fs = require('fs');
import * as debug from 'debug';
import { FileInfoInterface } from '../interface/fileInfo.interface';
const es = require('event-stream');

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

export async function modifyHeaders(
  filepath: string,
  newFilepath: string,
): Promise<any> {
  const option = {
    mapHeaders: ({ header }) => header.toUpperCase(),
  };
  const data = await writeCSV(filepath, newFilepath, option);
  return data;
}

export async function writeCSV(
  filepath: any,
  newFilepath: any,
  option?: {},
): Promise<FileInfoInterface> {
  return new Promise<FileInfoInterface>((resolve, reject) => {
    let isHeader = true;
    const newCsv = fs.createWriteStream(newFilepath);
    fs.createReadStream(filepath)
      .pipe(es.split(/(\r?\n)/))
      .pipe(
        es.mapSync(function (data) {
          if (isHeader) {
            data = data.toUpperCase();
            isHeader = false;
          }
          newCsv.write(data);
        }),
      )
      .on('end', () => {
        resolve({ filepath, destination: newFilepath });
      });
  });
}

export async function getHeaderAndValues(
  filepath: any,
): Promise<{ heardersData: string[]; valuesData: string[] }> {
  const heardersData: string[] = [];
  const valuesData: string[] = [];
  const option = {
    mapValues: ({ header, index, values }) => {
      heardersData.push(header);
      valuesData.push(values);
    },
  };
  parseCSV(filepath, option);
  return { heardersData, valuesData };
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

// const createCsvWriter = csv_writer.createObjectCsvWriter;
// const {heardersData,valuesData} = await getHeaderAndValues(filepath)
// const csvWriter = createCsvWriter({
//     path: filepath,
//     header: heardersData
//   });
//   csvWriter
//     .writeRecords(valuesData)
//     .then(()=> console.log('The CSV file was written successfully'));

// const createCsvWriter = csv_writer.createObjectCsvWriter;
// const {heardersData,valuesData} = await getHeaderAndValues(filepath)
// const csvWriter = createCsvWriter({
//     path: filepath,
//     header: heardersData
//   });
//   csvWriter
//     .writeRecords(valuesData)
//     .then(()=> console.log('The CSV file was written successfully'));
// return new Promise<string>((resolve, reject) => {
//     fs.writeFile(
//         filepath,
//         data,
//         (error: NodeJS.ErrnoException | null, data: Buffer) => {
//             if (error) {
//                 reject(error);
//             } else {
//                 resolve(data.toString());
//             }
//         },
//     );
// });
