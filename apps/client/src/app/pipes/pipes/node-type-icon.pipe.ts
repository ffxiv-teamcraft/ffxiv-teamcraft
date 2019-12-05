import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nodeTypeIcon'
})
export class NodeTypeIconPipe implements PipeTransform {

  public static icons = [
    './assets/icons/nodes/060438.png',
    './assets/icons/nodes/060437.png',
    './assets/icons/nodes/060433.png',
    './assets/icons/nodes/060432.png',
    'https://garlandtools.org/db/images/060445.png'];

  transform(type: number): string {
    return NodeTypeIconPipe.icons[type];
  }

}
