import { Controller, Post, Body, HttpStatus, UsePipes, ValidationPipe, UseGuards, Req, Res } from '@nestjs/common';

/* DTO 및 Service 연결 */
import { CreateMemberDTO, LoginDTO } from './dto/members.dto';
import { MembersService } from './members.service';

/* 인증을 위한 import */
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express'; // clearCookie & status를 위한 import

@Controller('members')
export class MembersController {
    constructor(private readonly membersService: MembersService) { }

    @Post('register')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async register(@Body() data: CreateMemberDTO): Promise<{ success: boolean, nickname: string }> {
        return await this.membersService.register(data);
    }

    @Post('login')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async login(@Body() data: LoginDTO): Promise<{ success: boolean, accessToken: string }> {
        return await this.membersService.login(data);
    }

    @Post('logout') // 쿠키의 삭제는 Response 레벨에서 이루어지기 때문에 Controller에서 처리하는게 좋은 Practice라고 함
    @UseGuards(AuthGuard('jwt'))
    logout(@Req() req: Request, @Res() res: Response) {
        res.clearCookie('nest_typeORM_postgreSQL_jwt'); // Replace with your actual cookie name
        return res.status(HttpStatus.OK).json({ success: true, message: "Logged out successfully." });
    }
}

// /* Post/Comments 구현 후에 추가할 것 */
// router.delete('/purge', JWT_auth, async (req, res) => {
//     /* API to basically delete all posts and comments made by user, then delete itself */
//     // Dereference the member information
//     const memberID = req.user.userId;
//     try {
//         // Start a transaction (Atomic, reversible if error)
//         const result = await sequelize.transaction(async (t) => {
//             // Retrieve and count comments
//             const comments = await Comment.findAll({
//                 where: { memberID },
//                 attributes: ['commentContent'],
//                 transaction: t
//             });
//             // Count number of comments to delete and backup comments
//             const numCommentsDeleted = comments.length;
//             const delCommentContents = comments.map(c => c.commentContent);
//             // Delete comments
//             await Comment.destroy({
//                 where: { memberID },
//                 transaction: t
//             });
//             // Retrieve and count posts with titles
//             const posts = await Post.findAll({
//                 where: { memberID },
//                 attributes: ['postTitle'],
//                 transaction: t
//             });
//             // Count number of posts to delete and backup their titles
//             const numPostsDeleted = posts.length;
//             const delPostTitles = posts.map(p => p.postTitle);
//             // Delete posts
//             await Post.destroy({
//                 where: { memberID },
//                 transaction: t
//             });
//             // Delete the user account
//             await Member.destroy({
//                 where: { memberID },
//                 transaction: t
//             });
//             // If everything went well, resolve the transaction
//             return { numPostsDeleted, delPostTitles, numCommentsDeleted, delCommentContents };
//         });
//         // Transaction has been committed
//         // result contains the counts and data from deleted records
//         res.json({
//             success: true,
//             message: 'User and all related posts and comments have been deleted.',
//             data: {
//                 numCommentsDeleted: result.numCommentsDeleted,
//                 commentContents: result.delPostTitles,
//                 numPostsDeleted: result.numPostsDeleted,
//                 postTitles: result.delCommentContents
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         // If the transaction fails, nothing will be deleted
//         res.status(500).json({ success: false, message: 'Failed to delete user and related data.' });
//     }
// });
