import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

/* DTO & Repository */
import { CreateMemberDTO, LoginDTO } from './dto/members.dto';
import { MembersRepository } from './members.repository';

/* JWT & Passport */
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class MembersService {

    /* Member DB를 다루는 Repository 불러오기 */
    constructor(
        private membersRepository: MembersRepository,
        private jwtService: JwtService
    ) { }

    /* 회원가입 */
    async register(data: CreateMemberDTO): Promise<{ success: boolean, nickname: string }> {

        /* DTO에서 내용 불러오기 */
        const { nickname, password, passwordCheck } = data;

        /* 비밀번호 검증하기 */
        if (password !== passwordCheck) {
            throw new HttpException('Passwords do not match', HttpStatus.BAD_REQUEST);
        }

        /* 이미 가입되었는지 검증하기 */
        const nameCheck = await this.membersRepository.findByNickname(nickname);
        if (nameCheck) {
            throw new HttpException('Nickname Exists', HttpStatus.CONFLICT);
        }

        /* 가입 절차 밟기 (해싱 후) */
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt); // saltRounds 10
        const newMember = await this.membersRepository.createMember(nickname, hashedPassword); // create, save

        return { success: true, nickname: newMember.nickname };
    }

    /* 로그인 */
    async login(data: LoginDTO): Promise<{ success: boolean, accessToken: string }> {

        /* DTO에서 내용 불러오기 */
        const { nickname, password } = data;

        /* 가입된 닉네임이 맞는지 검증하기 */
        const nameCheck = await this.membersRepository.findByNickname(nickname);
        if (!nameCheck) {
            throw new HttpException('Nickname or Password Incorrect', HttpStatus.UNAUTHORIZED);
        }

        /* 닉네임 비밀번호가 맞는지 검증한 뒤 토큰 발급하기 */
        if (bcrypt.compare(password, nameCheck.password)) {
            const payload = { memberID: nameCheck.memberID };
            const accessToken = await this.jwtService.sign(payload);

            return { success: true, accessToken: accessToken };
        } else {
            throw new HttpException('Nickname or Password Incorrect', HttpStatus.UNAUTHORIZED)
        }

    }
}
