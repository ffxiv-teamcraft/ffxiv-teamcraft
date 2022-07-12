import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { UserService } from '../../core/database/user.service';

@Pipe({
  name: 'isVerified'
})
export class IsVerifiedPipe implements PipeTransform {

  constructor(private userService: UserService) {
  }

  transform(userId: string): Observable<boolean> {
    return this.userService.get(userId).pipe(
      map(user => {
        const entry = user.lodestoneIds.find(e => e.id === user.defaultLodestoneId);
        return entry && entry.verified;
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

}
