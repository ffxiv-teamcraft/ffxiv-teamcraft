import { merge, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, shareReplay, startWith, withLatestFrom } from 'rxjs/operators';
import { ofMessageType } from '../rxjs/of-message-type';
import { toIpcData } from '../rxjs/to-ipc-data';

/**
 * 1121: Cast with hooked fish
 * 3522: You apply <bait> to your line, sent for regular baits AND for mooches
 * 1129: Nothing bites
 */
export const MOOCH_LOG_MESSAGES = [1121, 3522, 1129];

export interface MoochStateInputs {
  packets$: Observable<any>;
  // Ids of every item that can be applied as a regular bait, used to tell baits and mooches apart
  baitIds$: Observable<Set<number>>;
  fishCaught$: Observable<{ id: number }>;
  // Anything meaning the line isn't holding a fish anymore: misses, early hooks, ignored fish, fishing idle
  reset$: Observable<unknown>;
}

/**
 * Turns a fishing log message into the mooch it selects, or null if it doesn't select any.
 *
 * Message 3522 is sent both when applying a regular bait and when mooching, param3 (the item put on the line)
 * is the only thing telling them apart, we can't rely on the order the other packets arrive in.
 */
export function resolveMoochId(logMessage: number, param3: number, baitIds: Set<number>, lastCatch: number | null): number | null {
  if (logMessage !== 1121 && logMessage !== 3522) {
    return null;
  }
  if (baitIds.has(param3)) {
    return null;
  }
  // A mooch can only ever be the fish we just caught, anything else means we misread the message.
  if (lastCatch !== null && param3 !== lastCatch) {
    console.warn(`[fishing-reporter] Ignoring mooch ${param3} from log message ${logMessage}, last catch was ${lastCatch}`);
    return null;
  }
  return param3;
}

/**
 * Single source of truth for the fish currently used as bait, shared by the overlay and the reports so
 * they can't drift apart.
 */
export function buildMoochState({ packets$, baitIds$, fishCaught$, reset$ }: MoochStateInputs): Observable<number | null> {
  const lastCatch$: Observable<number | null> = fishCaught$.pipe(
    map(fish => fish.id),
    startWith(null)
  );

  const moochSelection$ = packets$.pipe(
    ofMessageType('systemLogMessage'),
    toIpcData(),
    filter(packet => MOOCH_LOG_MESSAGES.includes(packet.param1)),
    withLatestFrom(baitIds$, lastCatch$),
    map(([packet, baitIds, lastCatch]) => resolveMoochId(packet.param1, packet.param3, baitIds, lastCatch))
  );

  const baitChange$ = packets$.pipe(
    ofMessageType('actorControlSelf', 'fishingBaitMsg'),
    toIpcData(),
    withLatestFrom(baitIds$),
    // This packet is also sent when mooching, with the fish id as bait, resetting on it would erase the mooch.
    filter(([packet, baitIds]) => baitIds.has(packet.baitId))
  );

  return merge(
    moochSelection$,
    merge(
      baitChange$,
      reset$,
      fishCaught$.pipe(debounceTime(750))
    ).pipe(
      map(() => null)
    )
  ).pipe(
    startWith(null),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );
}
