import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Placeholder Page for the server (Not required for current task)';
  }
}
