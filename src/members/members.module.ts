import { Module } from '@nestjs/common';
import { MemberEntity } from './members.entity';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

/* Repository */
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersRepository } from './members.repository';

/* JWT & Passports */
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([MemberEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: "1h"
      }
    })
  ],
  controllers: [
    MembersController
  ],
  providers: [
    MembersService,
    MembersRepository,
    JwtStrategy
  ], // JWT Parsing을 Members에서도 쓰고,
  exports: [
    JwtStrategy,
    PassportModule,
    MembersRepository
  ] // 다른 곳에서도 쓸 수 있게 열어주고
})
export class MembersModule { }
