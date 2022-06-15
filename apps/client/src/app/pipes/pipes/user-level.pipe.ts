import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { UserService } from '../../core/database/user.service';
import { UserLevel } from '../../model/other/user-level';

@Pipe({
  name: 'userLevel',
  pure: true
})
export class UserLevelPipe implements PipeTransform {

  constructor(private userService: UserService) {
  }

  transform(userId: string): Observable<UserLevel> {
    return this.userService.get(userId).pipe(
      map(user => {
        if (user.moderator) {
          return UserLevel.MODERATOR;
        }
        if (user.admin) {
          return UserLevel.ADMIN;
        }
        return UserLevel.USER;
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

}
