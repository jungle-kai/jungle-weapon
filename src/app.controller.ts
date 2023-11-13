import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
} // App-level 컨트롤러와 서비스는 이번 과제에 필요하지 않지만, 참고용으로 남겨둠
