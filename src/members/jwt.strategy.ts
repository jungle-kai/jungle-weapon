import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { MemberEntity } from "./members.entity";
import { MembersRepository } from "./members.repository";
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(MembersRepository)
        private membersRepository: MembersRepository
    ) {
        super({
            // secretOrKey: process.env.JWT_SECRET || config.get('jwt.secret'),
            secretOrKey: process.env.JWT_SECRET,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        })
    }

    async validate(payload) {
        const { memberID } = payload;

        const member: MemberEntity = await this.membersRepository.findByMemberID(memberID);
        if (!member) {
            throw new UnauthorizedException();
        }

        return member;
    }
}