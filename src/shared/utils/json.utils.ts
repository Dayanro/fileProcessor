const fs = require('fs');
import * as debug from 'debug';
import { FileInfoInterface } from '../interface/fileInfo.interface';
import { MetadataInterface } from '../interface/metadata.interface';
const path = require('path');

const log: debug.IDebugger = debug('fileprocessor:json:utils');

export async function writeJson(
  data: MetadataInterface,
  filePath: string,
  fileInfo: FileInfoInterface,
): Promise<MetadataInterface> {
  const jsonData = JSON.stringify(data);
  const { filename } = fileInfo;
  const splitName = filename?.split('.');
  const newFileName = `${splitName
    .slice(0, splitName.length - 1)
    .join('.')}.json`;
  const fullPath = path.join(filePath, newFileName);
  return new Promise<MetadataInterface>((resolve, reject) => {
    fs.writeFile(fullPath, jsonData, 'utf8', function (err) {
      if (err) {
        log('An error occured while writing JSON Object to File.');
        return log(err);
      }
      log('JSON file has been saved.');
      resolve(data);
    });
  });
}
