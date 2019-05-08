import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ingameStars',
  pure: true
})
export class IngameStarsPipe implements PipeTransform {

  transform(value: number): string {
    return '★'.repeat(value);
  }

}
