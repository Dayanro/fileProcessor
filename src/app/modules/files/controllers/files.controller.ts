import { Controller, UseFilters } from "@nestjs/common";
import { ReceiveFileDto } from "../dto/receive-file.dto";
import { moduleConfig } from "../files.config";
import { FilesService } from "../services/files.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { ExceptionFilter } from "src/shared/filter/rpc-exception.filter";

@Controller(moduleConfig.api.route)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @UseFilters(new ExceptionFilter())
  @MessagePattern({ cmd: "loadFile" })
  async loadFile(@Payload() receiveFileDto: ReceiveFileDto): Promise<any> {
    return await this.filesService.receive_file(receiveFileDto);
  }
}
