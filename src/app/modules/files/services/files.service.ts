import { HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { ReceiveFileDto } from '../dto/receive-file.dto';
import * as debug from 'debug';
import {
  fileIsValid,
  getFileInfo,
  getFileData,
  transformCSV,
} from 'src/shared/utils/csv.utils';
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
import { MetadataInterface } from 'src/shared/interface/metadata.interface';
import { writeJson } from 'src/shared/utils/json.utils';
import { ClientProxy } from '@nestjs/microservices';
import { AppService } from 'src/app.service';
const path = require('path');

const log: debug.IDebugger = debug('fileprocessor:files:service');

@Injectable()
export class FilesService {
  constructor(
    @Inject(forwardRef(() => AppService))
    protected readonly appService: AppService,
   private configService: ConfigService
  ) {}

  public async receive_file(receiveFile: ReceiveFileDto): Promise<any> {
    const { filename, filelocation } = receiveFile;
    const filepath = `${filelocation}/${filename}.csv`;
    const id = uuidv4();
    const isValidData = await fileIsValid(filepath);

    const date = new Date();
    const fileInfo: FileInfoInterface = {
      id,
      filepath,
      date,
      isValidData,
      filename,
    };
    this.loadFile(fileInfo);
    return HttpStatus[200];
  }

  public async loadFile(fileInfo: FileInfoInterface) {
    const { isValidData } = fileInfo;
    if (!isValidData) {
      this.appService.createNotification(
        moduleConfig.enums.evenType.fileError,
        fileInfo,
      );
    } else {
      const dirName = moduleConfig.enums.fileNames.workBucket;
      await this.moveFile(fileInfo, dirName);
    }
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
   this.appService.createNotification(
      moduleConfig.enums.evenType.fileRecived,
      currentFileInfo,
    );
    await this.processesData(currentFileInfo);
  }

  private async processesData(fileInfo: FileInfoInterface): Promise<any> {
    const startTs = Date.now();
    const newFileInfo: FileInfoInterface = { ...fileInfo, startTs };
    const dirName = moduleConfig.enums.fileNames.processedData;
    await this.transformFile(newFileInfo, dirName);
  }

  public async transformFile(fileInfo: FileInfoInterface, dirName: string) {
    let { id, filepath, filename, destination, fileChanges } = fileInfo;
    const newPath: string = await this.openFile(id, dirName);
    const newFilepath = path.join(newPath, filename);
    const newFileInfo: FileInfoInterface = await transformCSV(
      destination,
      newFilepath,
    );
    filepath = newFileInfo.filepath;
    destination = newFileInfo.destination;
    fileChanges = newFileInfo.fileChanges;
    const currentFileInfo: FileInfoInterface = {
      ...fileInfo,
      destination,
      filepath,
      fileChanges,
    };
    this.appService.createNotification(
      moduleConfig.enums.evenType.fileProcessed,
      currentFileInfo,
    );
    const metadata: MetadataInterface = await this.getMetadata(currentFileInfo);
  }

  private async getMetadata(
    fileInfo: FileInfoInterface,
  ): Promise<MetadataInterface> {
    const { id, destination, date, fileChanges } = fileInfo;
    const dirName: string = moduleConfig.enums.fileNames.metadata;
    const newPath: string = await this.openFile(id, dirName);
    const { size, linesNumber, headerList } = await getFileData(destination);
    const metadata: MetadataInterface = {
      id,
      startDate: date,
      endDate: new Date(),
      fileChanges,
      headerList,
      linesNumber,
      size,
    };

    await writeJson(metadata, newPath, fileInfo);
    return metadata;
  }
}
