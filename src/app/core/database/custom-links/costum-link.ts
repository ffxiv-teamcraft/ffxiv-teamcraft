import {DataModel} from '../storage/data-model';

export class CustomLink extends DataModel {
    uri: string;
    redirectTo: string;
}
