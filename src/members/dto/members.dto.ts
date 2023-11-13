import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class CreateMemberDTO {

    @IsString()
    @MinLength(3)
    @Matches(/^[A-Za-z0-9]{3,}$/)
    nickname: string;

    @IsString()
    @MinLength(4)
    password: string;

    @IsString()
    passwordCheck: string;
}

export class LoginDTO {

    @IsString()
    @IsNotEmpty()
    @Matches(/\S/) // No Whitespaces
    nickname: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/\S/)
    password: string;
}