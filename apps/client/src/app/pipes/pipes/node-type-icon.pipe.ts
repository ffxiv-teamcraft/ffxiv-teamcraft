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
    './assets/icons/nodes/060445.png',
    './assets/icons/nodes/060465.png',
    null,
    null,
    null,
    null,
    './assets/icons/island.png'
  ];

  public static timed_icons = [
    './assets/icons/nodes/060464.png',
    './assets/icons/nodes/060463.png',
    './assets/icons/nodes/060462.png',
    './assets/icons/nodes/060461.png',
    './assets/icons/nodes/060445.png',
    './assets/icons/nodes/060466.png'
  ];

  transform(type: number, timed?: boolean): string {
    return timed ? NodeTypeIconPipe.timed_icons[Math.abs(type)] : NodeTypeIconPipe.icons[Math.abs(type)];
  }
}
