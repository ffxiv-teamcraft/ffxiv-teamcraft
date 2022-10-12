import { Timestamp } from '@angular/fire/firestore';
import { ResignedReason } from './resigned-reason';


export interface ResignedFeedback {
  commissionId: string;
  date: Timestamp;
  reason: ResignedReason;
}
