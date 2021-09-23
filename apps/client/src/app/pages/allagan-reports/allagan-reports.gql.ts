import { Injectable } from '@angular/core';
import { Query } from 'apollo-angular';
import gql from 'graphql-tag';
import { AllaganReport } from './model/allagan-report';
import { AllaganReportQueueEntry } from './model/allagan-report-queue-entry';


@Injectable()
export class GetItemAllaganReportsQuery extends Query<{ allagan_reports: AllaganReport[] }, { itemId: number }> {
  public document = gql`
    query ItemAllaganReports($itemId: Int) {
      allagan_reports(where: {itemId: {_eq: $itemId}}) {
        source
        data
        created_at
        updated_at
        itemId
        reporter
        reviewer
        uid
      }
    }
  `;
}

@Injectable()
export class GetItemAllaganReportsQueueQuery extends Query<{ allagan_reports_queue: AllaganReportQueueEntry[] }, { itemId: number }> {
  public document = gql`
      query ItemAllaganReports($itemId: Int) {
        allagan_reports_queue(where: {itemId: {_eq: $itemId}}) {
          itemId
          author
          uid
          source
          data
          type
          report
          created_at
        }
      }
  `;
}
