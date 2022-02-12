import { HttpStatus, Injectable } from '@nestjs/common';
import { ReceiveFileDto } from '../dto/receive-file.dto';
import * as debug from 'debug';
import { modifyHeaders, parsedCSV, fileIsValid, readCSV } from 'src/shared/utils/csv.utils';
import { CustomException } from 'src/shared/exception/custom.exception';
import { createDirectory, createPath, moveFile } from 'src/shared/utils/file.utils';
import { ConfigService } from '@nestjs/config';
import {v4 as uuidv4} from 'uuid';


const log: debug.IDebugger = debug('fileprocessor:files:service');


@Injectable()
export class FilesService {
  constructor(private configService: ConfigService) { }

  public async receive_file(receiveFile: ReceiveFileDto):Promise<any>{
    const { filename, filelocation } = receiveFile;
    const path = `${filelocation}/${filename}.csv`;
    const isValidData = await fileIsValid(path);
    if (!isValidData) {
      throw new CustomException(400, ['Found null values in the file']);
    }
    return HttpStatus[200];
  }

}
