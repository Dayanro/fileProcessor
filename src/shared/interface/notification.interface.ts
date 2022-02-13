export interface NotificationInterface {
  UUID: string;
  date: Date;
  event_type: string;
  event_data: EventData;
}

export interface EventData {
  filename?: string;
  filepath?: string;
  moved_to?: string;
  received_timestamp?: Date;
  elapsed_time?: number;
}
