import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/* Modules */
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { MembersModule } from './members/members.module';

/* typeORM */
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './_configs/typeorm.config';

@Module({
  imports: [
    PostsModule,
    // CommentsModule,
    MembersModule,
    TypeOrmModule.forRoot(typeORMConfig)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
