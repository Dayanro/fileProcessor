import {  Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { moduleConfig } from './app/modules/files/files.config';
import { FileInfoInterface } from './shared/interface/fileInfo.interface';
import { EventData, NotificationInterface } from './shared/interface/notification.interface';
import * as debug from 'debug';

const log: debug.IDebugger = debug('fileprocessor:app:service');
@Injectable()
export class AppService {
    constructor(
        @Inject('NOTIFICATIONS')
        private readonly client: ClientProxy,
       ) {}


  public createNotification(
    eventType: string,
    fileInfo: FileInfoInterface,
  ):void{
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
    if (eventType === moduleConfig.enums.evenType.fileError) {
      delete notification.event_data.moved_to;
    }
    this.client.send({ cmd: 'create-notification' }, notification)
    .subscribe(result => log(result));
  }
}
