import { Module } from '@nestjs/common';
import { PostEntity } from './posts.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

/* Repository */
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsRepository } from './posts.repository';

/* Logins & Members */
import { MembersModule } from '../members/members.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity]),
    MembersModule
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsRepository],
  exports: [PostsRepository]
})
export class PostsModule { }
