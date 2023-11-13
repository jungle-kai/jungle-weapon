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

    async getAllExistingPosts(): Promise<PostEntity[]> {
        return this.createQueryBuilder('post')
            .getMany();
    }

    async getAllPostsForMember(member: MemberEntity): Promise<PostEntity[]> {
        return this.createQueryBuilder('post') // PostEntity에 대한 query 인스턴스를 생성 (alias를 'post'로)
            .where('post.memberID = :memberID', { memberID: member.memberID }) // PostEntity의 memberID를, 인자로 주어진 member의 memberID와 매칭되는지 확인 
            .getMany(); // Query를 실행하고 모든 일치하는 포스트를 불러오는 SQL 쿼리
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

    async deletePostWithCondition(postID: string, memberID: string): Promise<{ affected: number }> {
        const result = await this.createQueryBuilder('post') // 쿼리 인스턴스를 생성하고, 
            .delete() // 삭제를 (delete는 항상 앞에 와야 함),
            .from(PostEntity) // PostEntity 테이블에서 진행하되,
            .where("post.postID = :postID", { postID }) // postID가 인자로 주어진 값과 같고,
            .andWhere("post.memberID = :memberID", { memberID }) // memberID가 인자로 주어진 user의 memberID와 같은 경우에 한정
            .execute();

        return { affected: result.affected };
    }

}