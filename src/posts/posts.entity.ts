import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { MemberEntity } from '../members/members.entity';
import { CommentEntity } from '../comments/comments.entity';
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
    member: MemberEntity;

    @OneToMany(() => CommentEntity, comment => comment.post)
    comments: CommentEntity[];
}
