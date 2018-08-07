import {Action} from '@ngrx/store';

export enum StatsActionTypes {
    LoadStats = '[Stats] Load Stats',
    ListsCountUpdated = '[Stats] Lists Count Updated',
    ListsStoredCountUpdated = '[Stats] Stored Lists Count Updated',
}

export class LoadStats implements Action {
    readonly type = StatsActionTypes.LoadStats;
}

export class ListsCountUpdated implements Action {
    readonly type = StatsActionTypes.ListsCountUpdated;

    constructor(public readonly count: number) {
    }
}

export class ListsStoredCountUpdated implements Action {
    readonly type = StatsActionTypes.ListsStoredCountUpdated;

    constructor(public readonly count: number) {
    }
}

export type StatsActions = LoadStats | ListsCountUpdated | ListsStoredCountUpdated;
