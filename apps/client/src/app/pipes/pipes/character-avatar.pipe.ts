import { Pipe, PipeTransform } from '@angular/core';
import { LodestoneService } from '../../core/api/lodestone.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'characterAvatar'
})
export class CharacterAvatarPipe implements PipeTransform {
  constructor(private service: LodestoneService) {
  }

  transform(userId: string): Observable<string> {
    return this.service.getUserCharacter(userId).pipe(map((character) => character.character.Avatar));
  }
}
