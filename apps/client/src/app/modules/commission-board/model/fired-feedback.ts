import { FiredReason } from './fired-reason';
import firebase from 'firebase/app';

export interface FiredFeedback {
  commissionId: string;
  date: firebase.firestore.Timestamp;
  reason: FiredReason;
}
