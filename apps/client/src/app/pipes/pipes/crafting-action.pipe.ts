import { Pipe, PipeTransform } from '@angular/core';
import { CraftingAction, CraftingActionsRegistry } from '@ffxiv-teamcraft/simulator';

@Pipe({
  name: 'craftingAction'
})
export class CraftingActionPipe implements PipeTransform {

  transform(value: number | CraftingAction): CraftingAction {
    if (typeof value === 'number') {
      return CraftingActionsRegistry.createFromIds([value])[0];
    }
    return value;
  }

}
