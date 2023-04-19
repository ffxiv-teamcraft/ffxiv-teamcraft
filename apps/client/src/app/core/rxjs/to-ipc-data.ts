import type { Message } from '@ffxiv-teamcraft/pcap-ffxiv/models';
import { OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

export function toIpcData<T extends Message>(): OperatorFunction<T, T['parsedIpcData']> {
  return map((message) => {
      return message.parsedIpcData;
    }
  );
}
