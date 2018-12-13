import { ExternalListLinkParser } from './external-list-link-parser';
import { ExternalListData } from './external-list-data';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs';

export class FfxivCraftingLinkParser implements ExternalListLinkParser {

  canParse(url: string): boolean {
    return url.indexOf('ffxivcrafting.com') > -1 || url.indexOf('craftingasaservice.com') > -1;
  }

  parse(url: string): Observable<ExternalListData[]> {
    return of(url
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
          return {
            itemId: +entryData[0],
            quantity: +entryData[1]
          };
        })
    );
  }

}
