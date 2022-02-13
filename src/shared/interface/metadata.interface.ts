export interface MetadataInterface {
  id?: string;
  startDate?: Date;
  endDate?: Date;
  fileChanges?: FileChanges[];
  headerList?: string[];
  linesNumber?: number;
  size?: number;
}

export interface FileChanges {
  type: string;
  oldValue: string;
  newValue: string;
}
