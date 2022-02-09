import { HttpStatus, Injectable } from '@nestjs/common';
import { ReceiveFileDto } from '../dto/receive-file.dto';
import * as debug from 'debug';
import { modifyHeaders, parsedCSV, fileIsValid, readCSV } from 'src/shared/utils/csv.utils';
import { CustomException } from 'src/shared/exception/custom.exception';
import { RpcException } from '@nestjs/microservices';


const log: debug.IDebugger = debug('FileProcessor:files:service');


@Injectable()
export class FilesService {
  constructor() { }

  public async loadFile(receiveFile: ReceiveFileDto) {
    const { filename, filelocation } = receiveFile;
    const path = `${filelocation}/${filename}.csv`;
    const isValidData = await fileIsValid(path);
    if (!isValidData) {
      throw new CustomException(400, ['Found null values in the file']);
    } else {
      return HttpStatus[200];
    }
  }

}
