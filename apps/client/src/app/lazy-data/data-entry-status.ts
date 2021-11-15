export type LoadingStatus = 'full' | 'partial' | 'loading';

export interface DataEntryStatus {
  status: LoadingStatus,
  record?: Record<number, LoadingStatus>
}
