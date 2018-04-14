import {ExternalListData} from './external-list-data';

export interface ExternalListLinkParser {

    canParse(url: string): boolean;

    parse(url: string): ExternalListData[];
}
