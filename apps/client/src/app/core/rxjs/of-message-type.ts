import type { Message } from '@ffxiv-teamcraft/pcap-ffxiv/models';
import { Observable } from 'rxjs';

export const ofMessageType = <T extends Message, MT extends Message['type'], ST extends Message['subType']>(typeName: MT, subTypeName?: ST) => (source: Observable<Extract<T, { type: MT, subType?: ST }>>) =>
  new Observable<Extract<T, { type: MT, subType?: ST }>>(observer => {
    return source.subscribe({
      next(message) {
        if (message.type === typeName && (!subTypeName || message.subType === subTypeName)) {
          observer.next(message);
        }
      },
      error(err) {
        observer.error(err);
      },
      complete() {
        observer.complete();
      }
    });
  });
