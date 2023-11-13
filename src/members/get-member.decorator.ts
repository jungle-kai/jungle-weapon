import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { MemberEntity } from './members.entity';

/* 커스텀 데코레이터를 만드는 과정으로, Request Object에서 데이터를 추출/가공할 수 있도록 함 */
export const GetUser = createParamDecorator((data, ctx: ExecutionContext): MemberEntity => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
}) // data가 optional로 보이지만 필수

// createParamDecorator() 함수는 (data, ctx)를 인자로 가져가는데,
// data는 optional parameter로 특정 데이터를 데코레이터로 전달할 때 활용되며, 안쓰는것 같아도 넣어둬야 함
// ctx는 현재 실행중인 맥락 (Execution Context)를 의미하는 Object

// 결론적으로 말하자면, 위 함수를 통해서 새로운 @GetUser라는 데코레이터를 만드는데, 아웃풋은 'MemberEntity'
// ctx에서 HTTP Request Object를 추출하고, req.user에 MemberEntity가 담겨있다는 가정