import { Repository } from 'typeorm';
import { PostEntity } from './posts.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDTO } from './dto/posts.dto';
import { PostStatus } from './post-status.enum';
import { MemberEntity } from '../members/members.entity';

@Injectable()
export class PostsRepository extends Repository<PostEntity> {
    constructor(
        @InjectRepository(PostEntity)
        private readonly repository: Repository<PostEntity>
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }

    async createPost(data: CreatePostDTO, member: MemberEntity): Promise<PostEntity> {
        const { postTitle, postContent } = data;

        const post = this.create({
            postTitle,
            postContent,
            postStatus: PostStatus.PUBLIC,
            member
        });

        await this.save(post);
        return post;
    }

    async deletePost(postID: string): Promise<void> {
        await this.delete(postID);
    }

}