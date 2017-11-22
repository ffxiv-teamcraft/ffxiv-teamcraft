import {DataState} from './data-state.enum';

export class DataModel {
    $key?: string;
    state?: DataState = DataState.PRISTINE;
}
