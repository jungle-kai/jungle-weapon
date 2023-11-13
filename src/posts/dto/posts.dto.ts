import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePostDTO {

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    postTitle: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    postContent: string;
}