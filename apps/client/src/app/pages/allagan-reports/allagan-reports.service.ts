import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { AllaganReport } from './model/allagan-report';
import { GetItemAllaganReportsQuery, GetItemAllaganReportsQueueQuery } from './allagan-reports.gql';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { AllaganReportStatus } from './model/allagan-report-status';
import { AllaganReportQueueEntry } from './model/allagan-report-queue-entry';
import { first, map, mapTo, shareReplay, switchMap, tap } from 'rxjs/operators';
import { AllaganReportSource } from './model/allagan-report-source';
import { AllaganMetricsDashboardData } from './model/allagan-metrics-dashboard-data';
import { LocalStorageBehaviorSubject } from '../../core/rxjs/local-storage-behavior-subject';
import { uniq } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class AllaganReportsService {

  public readonly filter$ = new LocalStorageBehaviorSubject<AllaganReportSource[]>('allagan-reports:filter', []);

  constructor(private getItemAllaganReportsQuery: GetItemAllaganReportsQuery,
              private getItemAllaganReportsQueueQuery: GetItemAllaganReportsQueueQuery,
              private apollo: Apollo) {
  }

  public getItemReports = (itemId: number) => {
    return this.getItemAllaganReportsQuery.subscribe({ itemId }, { fetchPolicy: 'network-only' });
  };

  public getItemReportsQueue = (itemId: number) => {
    return this.getItemAllaganReportsQueueQuery.subscribe({ itemId }, { fetchPolicy: 'network-only' });
  };

  importFromGT(queue: AllaganReport[]): Observable<void> {
    const isFishing = queue[0].source === AllaganReportSource.FISHING;
    const query = gql`mutation ImportFromGT($data: [allagan_reports_insert_input!]!) {
        delete_allagan_reports(where: {gt: {_eq: true}, source: {_${isFishing ? '' : 'n'}in: ["${AllaganReportSource.FISHING}", "${AllaganReportSource.SPEARFISHING}"]}}) {
          affected_rows
        }
        insert_allagan_reports(objects: $data) {
          affected_rows
        }
      }`;
    return this.apollo.mutate({
      mutation: query,
      variables: {
        data: queue
      }
    }).pipe(mapTo(void 0));
  }

  getDashboardData(subscribe = false): Observable<AllaganMetricsDashboardData> {
    const allReports = gql`subscription AllaganMetricsDashboardData {
        all_reports: allagan_reports_aggregate {
          aggregate {
            count
          }
        }
      }`;

    const appliedReports = gql`subscription AllaganMetricsDashboardData {
        applied_reports: allagan_reports_aggregate(where: {applied: {_eq: true}}) {
          aggregate {
            count
          }
        }
      }`;
    return combineLatest([
      this.apollo.subscribe<any>({
        query: allReports,
        fetchPolicy: 'network-only'
      }),
      this.apollo.subscribe<any>({
        query: appliedReports,
        fetchPolicy: 'network-only'
      })
    ]).pipe(
      subscribe ? tap() : first(),
      map(([resAll, resApplied]) => {
        return {
          reportsCount: resAll.data.all_reports.aggregate.count,
          appliedReportsCount: resApplied.data.applied_reports.aggregate.count
        };
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  getQueueStatus(): Observable<Partial<AllaganReportQueueEntry>[]> {
    return this.filter$.pipe(
      switchMap(filter => {
        if (filter.length === 0) {
          filter = uniq(Object.keys(AllaganReportSource)) as AllaganReportSource[];
        }
        const query = gql`subscription AllaganReportsQueueStatus($sources: [String!]!) {
          allagan_reports_queue(where: {source: {_in: $sources}}) {
            itemId
            author
            uid
            source
            data
            type
          }
        }`;
        return this.apollo.subscribe<any>({
          query,
          fetchPolicy: 'network-only',
          variables: {
            sources: filter
          }
        }).pipe(
          map(res => {
            return res.data.allagan_reports_queue.map(row => {
              if (typeof row.data === 'string') {
                row.data = JSON.parse(row.data);
              }
              return row;
            });
          }),
          shareReplay({ bufferSize: 1, refCount: true })
        );
      })
    );
  }

  addReportToQueue(report: AllaganReport): Observable<any> {
    const query = gql`mutation addAllaganReportToQueue($data: allagan_reports_queue_insert_input!) {
        insert_allagan_reports_queue_one(object: $data) {
          uid
        }
      }`;
    return this.apollo.mutate({
      mutation: query,
      variables: {
        data: {
          ...report,
          data: JSON.stringify(report.data),
          type: AllaganReportStatus.PROPOSAL,
          report: null
        }
      }
    });
  }

  suggestModification(reportId: string, report: AllaganReport): Observable<any> {
    const query = gql`mutation suggestModification($data: allagan_reports_queue_insert_input!) {
        insert_allagan_reports_queue_one(object: $data) {
          uid
        }
      }`;
    return this.apollo.mutate({
      mutation: query,
      variables: {
        data: {
          ...report,
          data: JSON.stringify(report.data),
          type: AllaganReportStatus.MODIFICATION,
          report: reportId
        }
      }
    });
  }

  suggestDeletion(report: AllaganReport): Observable<any> {
    const query = gql`mutation suggestDeletion($data: allagan_reports_queue_insert_input!) {
        insert_allagan_reports_queue_one(object: $data) {
          uid
        }
      }`;
    return this.apollo.mutate({
      mutation: query,
      variables: {
        data: {
          report: report.uid,
          type: AllaganReportStatus.DELETION,
          data: JSON.stringify(report.data),
          itemId: report.itemId,
          source: report.source
        }
      }
    });
  }

  acceptProposal(proposal: AllaganReportQueueEntry): Observable<any> {
    const query = gql`mutation acceptAllaganReportProposal($report: allagan_reports_insert_input!, $queueEntryId: uuid!) {
          delete_allagan_reports_queue_by_pk(uid: $queueEntryId) {
            uid
          }
          insert_allagan_reports_one(object: $report) {
            uid
          }
        }
    `;
    return this.apollo.mutate({
      mutation: query,
      variables: {
        queueEntryId: proposal.uid,
        report: {
          itemId: proposal.itemId,
          source: proposal.source,
          data: JSON.stringify(proposal.data),
          reporter: proposal.author
        }
      }
    });
  }

  acceptManyProposal(proposals: AllaganReportQueueEntry[]): Observable<any> {
    const query = gql`mutation acceptManyAllaganReportProposal($reports: [allagan_reports_insert_input!]!, $queueEntryIds: [uuid!]!) {
          delete_allagan_reports_queue(where: {uid: {_in: $queueEntryIds}}) {
            affected_rows
          }
          insert_allagan_reports(objects: $reports) {
            affected_rows
          }
        }
    `;
    return this.apollo.mutate({
      mutation: query,
      variables: {
        queueEntryIds: proposals.map(p => p.uid),
        reports: proposals.map(proposal => {
          return {
            itemId: proposal.itemId,
            source: proposal.source,
            data: JSON.stringify(proposal.data),
            reporter: proposal.author
          };
        })
      }
    });
  }

  acceptDeletion(proposal: AllaganReportQueueEntry): Observable<any> {
    const query = gql`mutation acceptAllaganReportProposal($reportId: uuid!, $queueEntryId: uuid!) {
          delete_allagan_reports_queue_by_pk(uid: $queueEntryId) {
            uid
          }
          delete_allagan_reports_by_pk(uid: $reportId) {
            uid
          }
        }
    `;
    return this.apollo.mutate({
      mutation: query,
      variables: {
        queueEntryId: proposal.uid,
        reportId: proposal.report
      }
    });
  }

  acceptModification(proposal: AllaganReportQueueEntry): Observable<any> {
    const query = gql`mutation acceptAllaganReportModification($reportId: uuid!, $queueEntryId: uuid!, $data: jsonb!, $reporter: String!) {
          delete_allagan_reports_queue_by_pk(uid: $queueEntryId) {
            uid
          }
          update_allagan_reports_by_pk(pk_columns: {uid: $reportId}, _set: {data: $data, reporter:$reporter, applied: false }) {
            uid
          }
        }
    `;
    return this.apollo.mutate({
      mutation: query,
      variables: {
        queueEntryId: proposal.uid,
        reportId: proposal.report,
        data: proposal.data,
        reporter: proposal.author
      }
    });
  }

  reject(proposal: AllaganReportQueueEntry): Observable<any> {
    const query = gql`mutation rejectAllaganReportProposal($queueEntryId: uuid!) {
          delete_allagan_reports_queue_by_pk(uid: $queueEntryId) {
            uid
          }
        }
    `;
    return this.apollo.mutate({
      mutation: query,
      variables: {
        queueEntryId: proposal.uid
      }
    });
  }

  rejectMany(proposals: AllaganReportQueueEntry[]): Observable<any> {
    const query = gql`mutation rejectAllaganReportProposal($queueEntryIds: [uuid!]!) {
          delete_allagan_reports_queue(where: {uid: {_in: $queueEntryIds}}) {
            affected_rows
          }
        }
    `;
    return this.apollo.mutate({
      mutation: query,
      variables: {
        queueEntryIds: proposals.map(p => p.uid)
      }
    });
  }
}
