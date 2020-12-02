import { Commission } from '../../../modules/commission-board/model/commission';
import { CommissionTag } from '../../../modules/commission-board/model/commission-tag';

export interface CommissionBoardDisplay {
  subscribed: boolean;
  datacenter: string;
  commissions: Commission[];
  tags: CommissionTag[];
}
