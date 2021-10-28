import { ExternalListLinkParser } from './external-list-link-parser';
import { Observable, of } from 'rxjs';

export class FfxivCraftingLinkParser implements ExternalListLinkParser {

  canParse(url: string): boolean {
    return url.indexOf('ffxivcrafting.com') > -1 || url.indexOf('craftingasaservice.com') > -1;
  }

  parse(url: string): Observable<string> {
    return of(btoa(url
      // Split with character '/'
      .split('/')
      // Take the last element (everything after the last '/'
      .pop()
      // Split with character ':' to have each entry
      .split(':')
      // Change entry string for an ExternalListData model
      .map(entry => {
        // ',' is the separator between item id and quantity
        const entryData = entry.split(',');
        return `${entryData[0]},null,${entryData[1]}`;
      }).join(';')));
  }

  getName(): string {
    return 'FFXIV Crafting/CaaS';
  }

}
