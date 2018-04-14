import {ExternalListLinkParser} from './external-list-link-parser';
import {ExternalListData} from './external-list-data';

export class FfxivCraftingLinkParser implements ExternalListLinkParser {

    // http://www.ffxivcrafting.com/list/saved/15538,1:15549,1:15515,1:15516,1:15534,1:15518,1:15519,1:15530,1:15531,1:15532,1:15533,2:5060,2

    canParse(url: string): boolean {
        return url.indexOf('ffxivcrafting.com') > -1 || url.indexOf('craftingasaservice.com') > -1;
    }

    parse(url: string): ExternalListData[] {
        return url
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
            });
    }

}
