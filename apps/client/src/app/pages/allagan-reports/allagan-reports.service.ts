import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AllaganReport } from './model/allagan-report';
import { GetItemAllaganReportsQuery, GetItemAllaganReportsQueueQuery } from './allagan-reports.gql';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { AllaganReportStatus } from './model/allagan-report-status';
import { AllaganReportQueueEntry } from './model/allagan-report-queue-entry';
import { map, mapTo, switchMap } from 'rxjs/operators';
import { AllaganReportSource } from './model/allagan-report-source';

@Injectable({
  providedIn: 'root'
})
export class AllaganReportsService {
  [x: string]: any;

  public readonly reloader$: BehaviorSubject<void> = new BehaviorSubject(void 0);

  constructor(private getItemAllaganReportsQuery: GetItemAllaganReportsQuery,
              private getItemAllaganReportsQueueQuery: GetItemAllaganReportsQueueQuery,
              private apollo: Apollo) {
  }

  public getItemReports = (itemId: number) => {
    return this.getItemAllaganReportsQuery.fetch({ itemId }, { fetchPolicy: 'network-only' });
  };

  public getItemReportsQueue = (itemId: number) => {
    return this.getItemAllaganReportsQueueQuery.fetch({ itemId }, { fetchPolicy: 'network-only' });
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

  getQueueStatus(): Observable<{ itemId: number, count: number }[]> {
    const query = gql`query GetAllaganReportsQueueStatus {
        allagan_reports_queue_per_item {
          itemId
          count
        }
      }`;
    return this.reloader$.pipe(
      switchMap(() => {
        return this.apollo.query<any>({
          query,
          fetchPolicy: 'network-only'
        }).pipe(
          map(res => {
            return res.data.allagan_reports_queue_per_item;
          })
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
          update_allagan_reports_by_pk(pk_columns: {uid: $reportId}, _set: {data: $data, reporter:$reporter }) {
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
}
