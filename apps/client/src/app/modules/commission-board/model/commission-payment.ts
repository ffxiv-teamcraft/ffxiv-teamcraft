import firebase from 'firebase/compat/app';

export class CommissionPayment {
  public timestamp: firebase.firestore.Timestamp = firebase.firestore.Timestamp.now();

  constructor(public amount: number) {
  }
}
