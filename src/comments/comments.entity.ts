import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { MemberEntity } from '../members/members.entity';
import { PostEntity } from '../posts/posts.entity';

@Entity('Comments')
export class CommentEntity {
    @PrimaryGeneratedColumn('uuid')
    commentID: string;

    @Column('text')
    commentContent: string;

    @ManyToOne(() => MemberEntity, member => member.comments)
    member: MemberEntity;

    @ManyToOne(() => PostEntity, post => post.comments)
    post: PostEntity;
}

