import { BadRequestException, PipeTransform } from '@nestjs/common';
import { PostStatus } from '../post-status.enum';

export class PostStatusValidationPipe implements PipeTransform {

    readonly StatusOptions = [
        PostStatus.PUBLIC,
        PostStatus.PRIVATE
    ]

    transform(value: any) {
        value = value.toUpperCase();

        if (!this.isStatusValid(value)) {
            throw new BadRequestException(`${value} isn't in the status options`);
        }

        return value;
    }

    private isStatusValid(status: any) {
        const index = this.StatusOptions.indexOf(status);
        return index !== -1; // -1이 나오면 없는값이므로 false를 반환
    }
}