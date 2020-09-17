import { OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';
import { BasePacket } from '../../model/pcap/BasePacket';

export function ofPacketSubType<R extends BasePacket>(
  subType: string
): OperatorFunction<BasePacket, R> {
  return filter<R>((packet: BasePacket) => {
      return subType === packet.subType;
    }
  );
}
