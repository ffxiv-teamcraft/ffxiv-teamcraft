import { Timestamp } from '@angular/fire/firestore';
import { FiredReason } from './fired-reason';


export interface FiredFeedback {
  commissionId: string;
  date: Timestamp;
  reason: FiredReason;
}
