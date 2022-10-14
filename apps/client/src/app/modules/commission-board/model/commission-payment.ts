import { Timestamp } from '@angular/fire/firestore';

export class CommissionPayment {
  public timestamp: Timestamp = Timestamp.now();

  constructor(public amount: number) {
  }
}
