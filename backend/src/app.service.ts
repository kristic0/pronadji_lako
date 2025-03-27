import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getConfirmation(): string {
    return 'Api works!';
  }
}
