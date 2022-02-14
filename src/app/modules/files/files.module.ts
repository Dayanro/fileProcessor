import { Module, forwardRef } from '@nestjs/common';
import { FilesController } from './controllers/files.controller';
import { FilesService } from './services/files.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport, ClientsModule } from '@nestjs/microservices';
import { AppModule } from 'src/app.module';

@Module({
  imports: [   
    forwardRef(() => AppModule),
    ConfigModule.forRoot()
  ],
  controllers: [FilesController],
  providers: [
    FilesService,
  ]
})
export class FilesModule {}
