import { ResignedReason } from './resigned-reason';
import firebase from 'firebase/compat/app';

export interface ResignedFeedback {
  commissionId: string;
  date: firebase.firestore.Timestamp;
  reason: ResignedReason;
}
