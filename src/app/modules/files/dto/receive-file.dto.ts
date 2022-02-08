import { IsString } from 'class-validator';

export class ReceiveFileDto {
    @IsString()
    filename: string;

    @IsString()
    filelocation: string;
}