import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AllaganReport } from './model/allagan-report';
import { GetItemAllaganReportsQuery, GetItemAllaganReportsQueueQuery } from './allagan-reports.gql';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { AllaganReportStatus } from './model/allagan-report-status';

@Injectable()
export class AllaganReportsService {
  [x: string]: any;

  constructor(private getItemAllaganReportsQuery: GetItemAllaganReportsQuery,
              private getItemAllaganReportsQueueQuery: GetItemAllaganReportsQueueQuery,
              private apollo: Apollo) {
  }

  public getItemReports = (itemId: number) => {
    return this.getItemAllaganReportsQuery.fetch({ itemId });
  };

  public getItemReportsQueue = (itemId: number) => {
    return this.getItemAllaganReportsQueueQuery.watch({ itemId }).valueChanges;
  };

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
}
