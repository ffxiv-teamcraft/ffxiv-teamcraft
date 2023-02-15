export interface FullLoading {
  status: 'full';
  loading: true;
}

export interface FullyLoaded {
  status: 'full';
}

export interface PartialLoading {
  status: 'partial';
  loading: Array<number | string | symbol>;
  loaded: Array<number | string | symbol>;
}

export interface PartiallyLoaded {
  status: 'partial';
  loaded: Array<number | string | symbol>;
  loading: Array<number | string | symbol>;
}

export type LazyDataLoadingState = PartialLoading | FullLoading | FullyLoaded | PartiallyLoaded;
