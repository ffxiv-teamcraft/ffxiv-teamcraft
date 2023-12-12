import { Pipe, PipeTransform } from '@angular/core';
import { LinkToolsService } from '../../core/tools/link-tools.service';

@Pipe({
    name: 'tcLink',
    standalone: true
})
export class TeamcraftLinkPipe implements PipeTransform {

  constructor(private linkTools: LinkToolsService) {
  }

  transform(path: string): string {
    return this.linkTools.getLink(path);
  }

}
