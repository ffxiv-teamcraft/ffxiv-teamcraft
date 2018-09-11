import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nodeTypeIcon'
})
export class NodeTypeIconPipe implements PipeTransform {

  public static icons = [
    './assets/icons/Mineral_Deposit.png',
    './assets/icons/MIN.png',
    './assets/icons/Mature_Tree.png',
    './assets/icons/BTN.png',
    'https://garlandtools.org/db/images/FSH.png'];

  transform(type: number): string {
    return NodeTypeIconPipe.icons[type];
  }

}
