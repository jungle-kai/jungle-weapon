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
        private postsRepository: PostsRepository,
    ) { }

    async getAllPosts(): Promise<PostEntity[]> {
        return this.postsRepository.getAllExistingPosts();
    }

    async getPostById(postID: string): Promise<PostEntity> {
        const found = await this.postsRepository.findOneBy({ postID }); // Custom Repository까지 가지 않음

        if (!found) {
            throw new NotFoundException(`Cant find Post with id ${postID}`);
        }
        return found;
    }

    async getAllMyPosts(member: MemberEntity): Promise<PostEntity[]> {
        return this.postsRepository.getAllPostsForMember(member);
    }

    createPost(data: CreatePostDTO, user: MemberEntity): Promise<PostEntity> {
        return this.postsRepository.createPost(data, user);
    }

    async deletePost(postID: string, user: MemberEntity): Promise<{ success: boolean }> {

        const { affected } = await this.postsRepository.deletePostWithCondition(postID, user.memberID);

        if (affected === 0) {
            throw new NotFoundException(`Cant find Post with id ${postID}`);
        }

        return { success: true };
    }

    async updatePostStatus(postID: string, status: PostStatus): Promise<PostEntity> {

        const post = await this.getPostById(postID); // Custom Repository까지 가지 않음

        post.postStatus = status;
        await this.postsRepository.save(post);

        return post;
    }

}