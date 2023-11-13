import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { MemberEntity } from '../members/members.entity';
// import { CommentEntity } from '../comments/comments.entity';
import { PostStatus } from './post-status.enum';

@Entity()
export class PostEntity {
    @PrimaryGeneratedColumn('uuid')
    postID: string;

    @Column()
    postTitle: string;

    @Column('text')
    postContent: string;

    @Column()
    postStatus: PostStatus;

    @ManyToOne(() => MemberEntity, member => member.posts)
    @JoinColumn({
        name: 'memberId', // typeORM 네이밍 컨벤션에 따라서 이 칼럼 이름이 이상하게 나오니, 지정해주는 과정
        referencedColumnName: 'memberID'
    }) member: MemberEntity;

    // @OneToMany(() => CommentEntity, comment => comment.post)
    // comments: CommentEntity[];
}
