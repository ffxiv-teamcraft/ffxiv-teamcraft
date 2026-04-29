import { Pipe, PipeTransform, inject } from '@angular/core';
import { LodestoneService } from '../../core/api/lodestone.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
    name: 'characterName',
    standalone: true
})
export class CharacterNamePipe implements PipeTransform {
  private service = inject(LodestoneService);
  private translate = inject(TranslateService);


  transform(userId: string): Observable<string> {
    return this.service.getUserCharacter(userId).pipe(map((character) => (character ? character.character.Name : this.translate.instant('COMMON.Anonymous'))));
  }
}
