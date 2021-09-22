import { Injectable } from '@angular/core';
import { GetItemAllaganReportsQuery } from './allagan-reports.gql';

@Injectable()
export class AllaganReportsService {

  constructor(private getItemAllaganReportsQuery: GetItemAllaganReportsQuery) {
  }

  public getItemReports = (itemId: number) => {
    return this.getItemAllaganReportsQuery.fetch({ itemId });
  };
}
