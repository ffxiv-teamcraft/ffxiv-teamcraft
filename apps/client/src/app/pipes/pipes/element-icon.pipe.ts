import { Pipe, PipeTransform } from '@angular/core';
import { RecipeElement } from '../../model/garland-tools/recipe-element';

@Pipe({
  name: 'elementIcon'
})
export class ElementIconPipe implements PipeTransform {
  transform(id: number): string {
    return `./assets/icons/elements/item_element_${RecipeElement[id].toLowerCase()}.png`;
  }
}
