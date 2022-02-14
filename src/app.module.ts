import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FilesModule } from './app/modules/files/files.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport, ClientsModule } from '@nestjs/microservices';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    FilesModule, 
    ClientsModule.register([
      {
        name: 'NOTIFICATIONS',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 8081
        }
      }
    ])
 ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
  exports:[AppService]
})
export class AppModule {}
