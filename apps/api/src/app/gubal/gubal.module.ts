import { Module } from '@nestjs/common';
import { GubalController } from './gubal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: []
    })
  ],
  controllers: [
    GubalController
  ]
})
export class GubalModule {

}
