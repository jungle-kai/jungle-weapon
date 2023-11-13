import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from 'typeorm';
import { PostEntity } from '../posts/posts.entity';
// import { CommentEntity } from '../comments/comments.entity';

@Entity()
@Unique(['nickname'])
export class MemberEntity {
    @PrimaryGeneratedColumn('uuid')
    memberID: string;

    @Column({ unique: true })
    nickname: string;

    @Column()
    password: string;

    @OneToMany(() => PostEntity, post => post.member)
    posts: PostEntity[];

    // @OneToMany(() => CommentEntity, comment => comment.member)
    // comments: CommentEntity[];
}
