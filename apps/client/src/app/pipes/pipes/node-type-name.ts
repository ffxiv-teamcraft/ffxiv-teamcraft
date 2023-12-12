import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'nodeTypeName',
    standalone: true
})
export class NodeTypeNamePipe implements PipeTransform {
  public static icons = ['Mineral', 'Rocky', 'Tree', 'Vegetation', 'Fishing'];

  transform(type: number): string {
    return NodeTypeNamePipe.icons[type];
  }
}
