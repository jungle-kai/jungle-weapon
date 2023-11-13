import { Injectable, NotFoundException } from '@nestjs/common';

/* DTO, Status, Repository */
import { CreatePostDTO } from './dto/posts.dto';
import { PostStatus } from './post-status.enum';
import { PostsRepository } from './posts.repository';
import { PostEntity } from './posts.entity';
import { MemberEntity } from '../members/members.entity';

@Injectable()
export class PostsService {
    constructor(
        private postRepository: PostsRepository,
    ) { }

    async getAllPosts(member: MemberEntity): Promise<PostEntity[]> {
        const query = this.postRepository.createQueryBuilder('post');

        query.where('post.memberID = :memberID', { memberId: member.memberID });

        const posts = await query.getMany();
        return posts;
    }

    async getPostById(postID: string): Promise<PostEntity> {
        const found = await this.postRepository.findOneBy({ postID });

        if (!found) {
            throw new NotFoundException(`Cant find Post with id ${postID}`);
        }
        return found;
    }

    createPost(data: CreatePostDTO, user: MemberEntity): Promise<PostEntity> {
        return this.postRepository.createPost(data, user);
    }

    async deletePost(id: number, member: MemberEntity): Promise<void> {

        const result = await this.postRepository.createQueryBuilder().delete().from(PostEntity).where("id = :id", { id: id }).andWhere("memberId = :memberId", { memberId: member.id }).execute();

        if (result.affected === 0) {
            throw new NotFoundException(`Cant find Post with id ${id}`);
        }

        console.log('result', result);
    }

    async updatePostStatus(id: number, status: PostStatus): Promise<PostEntity> {
        const post = await this.getPostById(id);
        post.postStatus = status;
        await this.postRepository.save(post);

        return post;
    }

}