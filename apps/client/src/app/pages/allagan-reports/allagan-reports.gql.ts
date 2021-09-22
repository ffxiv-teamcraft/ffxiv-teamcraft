import { Injectable } from '@angular/core';
import { Query } from 'apollo-angular';
import gql from 'graphql-tag';
import { AllaganReport } from './allagan-report';


@Injectable()
export class GetItemAllaganReportsQuery extends Query<AllaganReport, { itemId: number }> {
  public document = gql`
    query ItemAllaganReports($itemId: Int) {
      allagan_reports(where: {itemId: {_eq: $itemId}}) {
        source,
        data
      }
    }
  `;
}

@Injectable()
export class UpdateItemAllaganReportsQuery extends Query<{ itemId: number }> {
  public document = gql`
    mutation ItemAllaganReports($itemId: Int) {
      allagan_reports(where: {itemId: {_eq: $itemId}}) {
        source,
        data
      }
    }
  `;
}
