import { Pipe, PipeTransform, inject } from '@angular/core';
import { LodestoneService } from '../../core/api/lodestone.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({
    name: 'characterAvatar',
    standalone: true
})
export class CharacterAvatarPipe implements PipeTransform {
  private service = inject(LodestoneService);


  transform(userId: string): Observable<string> {
    return this.service.getUserCharacter(userId).pipe(map((character) => character.character.Avatar));
  }
}
