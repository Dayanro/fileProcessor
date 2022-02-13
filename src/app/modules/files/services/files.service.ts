import { HttpStatus, Injectable } from '@nestjs/common';
import { ReceiveFileDto } from '../dto/receive-file.dto';
import * as debug from 'debug';
import { fileIsValid, writeCSV } from 'src/shared/utils/csv.utils';
import { CustomException } from 'src/shared/exception/custom.exception';
import {
  createDirectory,
  createPath,
  moveFile,
} from 'src/shared/utils/file.utils';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import {
  EventData,
  NotificationInterface,
} from 'src/shared/interface/notification.interface';
import { moduleConfig } from '../files.config';
import { FileInfoInterface } from 'src/shared/interface/fileInfo.interface';
const path = require('path');

const log: debug.IDebugger = debug('fileprocessor:files:service');

@Injectable()
export class FilesService {
  constructor(private configService: ConfigService) {}

  public async receive_file(receiveFile: ReceiveFileDto): Promise<any> {
    const { filename, filelocation } = receiveFile;
    const filepath = `${filelocation}/${filename}.csv`;
    const isValidData = await fileIsValid(filepath);
    if (!isValidData) {
      throw new CustomException(400, ['Found null values in the file']);
    }
    const id = uuidv4();
    const date = new Date();
    const fileInfo: FileInfoInterface = { id, filepath, date };
    this.loadFile(fileInfo);
    return HttpStatus[200];
  }

  public async loadFile(fileInfo: FileInfoInterface) {
    const dirName = 'work-bucket';
    await this.moveFile(fileInfo, dirName);
    return HttpStatus[200];
  }
  public async openFile(id: string, dirName: string): Promise<string> {
    const workDirectory: string = process.cwd();
    const dirPath: string = this.configService.get<string>('workspace_path');
    const newPath: string = createPath(workDirectory, dirName, dirPath, id);
    await createDirectory(newPath);
    return newPath;
  }

  public async moveFile(fileInfo: FileInfoInterface, dirName: string) {
    const { id, filepath } = fileInfo;
    const newPath: string = await this.openFile(id, dirName);
    const newFileInfo: FileInfoInterface = await moveFile(
      filepath,
      newPath,
      id,
    );
    const { destination, filename } = newFileInfo;
    const currentFileInfo: FileInfoInterface = {
      ...fileInfo,
      destination,
      filename,
    };
    const notification: NotificationInterface = this.createNotification(
      moduleConfig.enums.evenType.fileRecived,
      currentFileInfo,
    );
    await this.processesData(currentFileInfo);
  }

  private async processesData(fileInfo: FileInfoInterface): Promise<any> {
    const startTs = Date.now();
    const newFileInfo: FileInfoInterface = { ...fileInfo, startTs };
    const dirName = 'processed-data';
    await this.writeFile(newFileInfo, dirName);
  }

  public async writeFile(fileInfo: FileInfoInterface, dirName: string) {
    let { id, filepath, filename, destination } = fileInfo;
    const newPath: string = await this.openFile(id, dirName);
    const newFilepath = path.join(newPath, filename);
    const newFileInfo: FileInfoInterface = await writeCSV(
      destination,
      newFilepath,
    );
    filepath = newFileInfo.filepath;
    destination = newFileInfo.destination;
    const currentFileInfo: FileInfoInterface = {
      ...fileInfo,
      destination,
      filepath,
    };
    const notification: NotificationInterface = this.createNotification(
      moduleConfig.enums.evenType.fileProcessed,
      currentFileInfo,
    );
  }

  private createNotification(
    eventType: string,
    fileInfo: FileInfoInterface,
  ): NotificationInterface {
    const { id, date, destination, filename, filepath, startTs } = fileInfo;
    const eventData: EventData = {
      filename,
      filepath,
      moved_to: destination,
      received_timestamp: date,
    };
    const notification: NotificationInterface = {
      UUID: id,
      date: new Date(),
      event_type: eventType,
      event_data: eventData,
    };
    if (eventType === moduleConfig.enums.evenType.fileProcessed) {
      notification.event_data.elapsed_time = Date.now() - startTs;
      delete notification.event_data.received_timestamp;
    }
    log('Notification', notification);
    return notification;
  }
}
