import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberEntity } from './members.entity';

@Injectable()
export class MembersRepository extends Repository<MemberEntity> {

    /* Member Repository의 커스텀 확장, 오리지널의 프로퍼티를 커스텀에 삽입 (핵심 과정) */
    constructor(
        @InjectRepository(MemberEntity)
        private readonly repository: Repository<MemberEntity>
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }

    /* 닉네임으로 멤버 찾기 */
    async findByNickname(nickname: string): Promise<MemberEntity | undefined> { // 없다면 Undefined가 되어야 함
        return this.findOne({ where: { nickname } });
    }

    /* MemberID로 멤버 찾기 */
    async findByMemberID(memberID: string): Promise<MemberEntity | undefined> {
        return this.findOne({ where: { memberID } });
    }

    /* 멤버 생성하기 */
    async createMember(nickname: string, hashedPassword: string): Promise<MemberEntity> {
        const newMember = this.create({ nickname, password: hashedPassword });
        await this.save(newMember);
        return newMember;
    }

}