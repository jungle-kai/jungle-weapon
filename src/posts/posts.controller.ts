import { Body, Controller, Get, Param, Post, Delete, Patch, UsePipes, ValidationPipe, ParseIntPipe, UseGuards } from '@nestjs/common';

/* 타 Entity Import */
import { PostEntity } from './posts.entity';
import { MemberEntity } from '../members/members.entity';

/* DTO, Pipe 및 Service, Status 연결 */
import { CreatePostDTO } from './dto/posts.dto';
import { PostStatusValidationPipe } from './pipes/post-status-validation.pipe'
import { PostsService } from './posts.service';
import { PostStatus } from './post-status.enum';

/* 인증을 위한 Import */
import { AuthGuard } from '@nestjs/passport';

/* 커스텀 데코레이터를 가져옴 (자세한건 해당 파일에 설명 ; HTTP Req에서 MemberEntity를 추출하는 데코레이터) */
import { GetUser } from '../members/get-member.decorator';

@Controller('posts')
@UseGuards(AuthGuard())
export class PostsController {

    constructor(private postsService: PostsService) { }

    @Get('/')
    getAllExistingPosts(): Promise<PostEntity[]> {
        return this.postsService.getAllPosts();
    }

    @Get('/:postID')
    getPostById(@Param('postID') postID: string): Promise<PostEntity> {
        return this.postsService.getPostById(postID);
    }

    @Get('/my')
    @UseGuards(AuthGuard('jwt'))
    getAllMyPosts(@GetUser() user: MemberEntity): Promise<PostEntity[]> {
        return this.postsService.getAllMyPosts(user);
    }

    @Post('/')
    @UseGuards(AuthGuard('jwt'))
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) // Option이 붙은 ValidationPipe
    createPost(
        @Body() data: CreatePostDTO,
        @GetUser() user: MemberEntity,
    ): Promise<PostEntity> {
        return this.postsService.createPost(data, user);
    }

    @Delete('/:postID')
    @UseGuards(AuthGuard('jwt'))
    deletePost(
        @Param('postID') postID: string,
        @GetUser() user: MemberEntity
    ): Promise<{ success: boolean }> {
        return this.postsService.deletePost(postID, user);
    }

    @Patch('/:postID/status')
    @UseGuards(AuthGuard('jwt'))
    updatePostStatus(
        @Param('postID') postID: string,
        @Body('status', PostStatusValidationPipe) status: PostStatus,
    ): Promise<PostEntity> {
        return this.postsService.updatePostStatus(postID, status);
    }

}