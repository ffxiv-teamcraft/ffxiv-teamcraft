import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { UserService } from '../../core/database/user.service';

@Pipe({
  name: 'isPatron'
})
export class IsPatronPipe implements PipeTransform {

  constructor(private userService: UserService) {
  }

  transform(userId: string): Observable<boolean> {
    return this.userService.get(userId).pipe(
      map(user => {
        return user.patron;
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

}
