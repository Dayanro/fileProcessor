import { FileChanges } from './metadata.interface';

export interface FileInfoInterface {
  id?: string;
  date?: Date;
  endDate?: Date;
  destination?: string;
  filename?: string;
  filepath?: string;
  startTs?: number;
  fileChanges?: FileChanges[];
  isValidData?: boolean;
}
