import { Commission } from '../../../modules/commission-board/model/commission';

export interface CommissionBoardDisplay {
  subscribed: boolean;
  datacenter: string;
  commissions: Commission[]
}
